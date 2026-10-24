import io
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.css_parser import parse_css_stylesheet
from app.services.statistics import calculate_css_statistics
from app.utils.validator import validate_css_file, MAX_FILE_SIZE_BYTES

client = TestClient(app)


# 1. Basic CSS with multiple rules
def test_basic_css_multiple_rules():
    css = """
    h1 { color: red; font-size: 20px; }
    p { margin: 10px; line-height: 1.5; }
    """
    rules, at_rules, warnings, comments, elapsed = parse_css_stylesheet(css, "basic.css")
    assert len(rules) == 2
    assert rules[0].selector == "h1"
    assert len(rules[0].declarations) == 2
    assert rules[1].selector == "p"
    assert len(rules[1].declarations) == 2
    assert len(warnings) == 0


# 2. Multiple selectors in one rule
def test_multiple_selectors_in_one_rule():
    css = "h1, h2, .title, #header { font-weight: bold; color: #111; }"
    rules, _, _, _, _ = parse_css_stylesheet(css)
    assert len(rules) == 1
    assert len(rules[0].selectors) == 4
    assert rules[0].selectors == ["h1", "h2", ".title", "#header"]
    assert rules[0].selector == "h1, h2, .title, #header"


# 3. CSS comments
def test_css_comments():
    css = """
    /* Header Comment */
    div {
        /* Inner Comment */
        color: blue;
    }
    /* Trailing Comment */
    """
    rules, _, _, comments_count, _ = parse_css_stylesheet(css)
    assert len(rules) == 1
    assert comments_count >= 2
    assert rules[0].declarations[0].property == "color"


# 4. Empty CSS input
def test_empty_css_input():
    css = ""
    rules, at_rules, warnings, comments, _ = parse_css_stylesheet(css)
    assert len(rules) == 0
    assert len(at_rules) == 0
    assert len(warnings) == 0
    assert comments == 0

    stats = calculate_css_statistics("empty.css", 0, rules, at_rules, warnings, comments, 0.5)
    assert stats.metadata.total_rules == 0
    assert stats.metadata.total_declarations == 0
    assert stats.metadata.unique_properties == 0


# 5. Whitespace-only CSS
def test_whitespace_only_css():
    css = "   \n\t  \r\n   "
    rules, at_rules, warnings, comments, _ = parse_css_stylesheet(css)
    assert len(rules) == 0
    assert len(at_rules) == 0
    assert len(warnings) == 0

    stats = calculate_css_statistics("spaces.css", len(css), rules, at_rules, warnings, comments, 0.4)
    assert stats.metadata.total_rules == 0
    assert stats.metadata.total_declarations == 0


# 6. Invalid CSS syntax
def test_invalid_css_syntax():
    # Broken CSS block with missing colon / malformed property
    css = """
    .card {
        color red;
        font-size: 16px;
    }
    """
    rules, at_rules, warnings, _, _ = parse_css_stylesheet(css)
    # The parser must not crash and should report the syntax error in warnings
    assert len(rules) == 1
    # font-size is valid, while the malformed declaration emits a parse warning
    valid_props = [d.property for d in rules[0].declarations]
    assert "font-size" in valid_props
    assert any(w.type == "parse_error" for w in warnings)


# 7. Duplicate declarations
def test_duplicate_declarations():
    css = """
    .alert {
        display: -webkit-flex;
        color: red;
        font-size: 14px;
        color: blue;
    }
    """
    rules, at_rules, warnings, _, _ = parse_css_stylesheet(css)
    assert len(rules) == 1
    # All declarations preserved (2 for color)
    assert len(rules[0].declarations) == 4
    dup_warnings = [w for w in warnings if w.type == "duplicate_declaration"]
    assert len(dup_warnings) == 1
    assert "color" in dup_warnings[0].message


# 8. !important declarations
def test_important_declarations():
    css = """
    .urgent {
        color: #ff0000 !important;
        background: yellow;
    }
    """
    rules, _, _, _, _ = parse_css_stylesheet(css)
    decls = rules[0].declarations
    assert decls[0].property == "color"
    assert decls[0].important is True
    assert decls[1].property == "background"
    assert decls[1].important is False


# 9. @media rules
def test_media_queries():
    css = """
    @media screen and (min-width: 768px) {
        .container {
            width: 750px;
        }
        .header {
            display: flex;
        }
    }
    """
    rules, at_rules, _, _, _ = parse_css_stylesheet(css)
    assert len(at_rules) == 1
    assert at_rules[0].at_keyword == "media"
    assert "min-width: 768px" in at_rules[0].prelude
    # Nested rules are extracted and linked to parent at-rule
    assert len(rules) == 2
    assert rules[0].parent_at_rule is not None
    assert "@media" in rules[0].parent_at_rule


# 10. CSS variables
def test_css_variables():
    css = """
    :root {
        --primary-color: #6366f1;
        --base-padding: 16px;
    }
    .box {
        color: var(--primary-color);
        padding: var(--base-padding);
    }
    """
    rules, _, _, _, _ = parse_css_stylesheet(css)
    assert len(rules) == 2
    assert rules[0].declarations[0].property == "--primary-color"
    assert rules[1].declarations[0].value == "var(--primary-color)"


# 11. Functions such as calc() and rgb()
def test_functions_calc_and_rgb():
    css = """
    .banner {
        width: calc(100% - 40px);
        background-color: rgb(240, 240, 250);
        height: min(500px, calc(100vh - 80px));
    }
    """
    rules, _, _, _, _ = parse_css_stylesheet(css)
    decls = rules[0].declarations
    assert "calc(100% - 40px)" in decls[0].value
    assert "rgb(240, 240, 250)" in decls[1].value
    assert "min(500px, calc(100vh - 80px))" in decls[2].value


# 12. Malformed or unsupported at-rules
def test_malformed_at_rules():
    css = """
    @foobar-unsupported test condition;
    h1 { color: teal; }
    """
    rules, at_rules, warnings, _, _ = parse_css_stylesheet(css)
    # Does not crash; records unsupported at-rule and processes subsequent valid rules
    assert len(rules) == 1
    assert len(at_rules) == 1
    assert at_rules[0].at_keyword == "foobar-unsupported"


# 13. Non-CSS uploads (e.g. PNG magic headers or invalid extension)
def test_non_css_file_validation():
    # PNG binary header
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    with pytest.raises(Exception) as exc:
        validate_css_file("image.css", png_bytes)
    assert "binary file" in str(exc.value.detail).lower()

    # Invalid extension
    with pytest.raises(Exception) as exc2:
        validate_css_file("test.exe", b"body { color: red; }")
    assert "invalid file extension" in str(exc2.value.detail).lower()


# 14. Oversized uploads (>2MB)
def test_oversized_upload_validation():
    large_payload = b"/* large */\n" * (2 * 1024 * 1024 // 10 + 100)
    assert len(large_payload) > MAX_FILE_SIZE_BYTES
    with pytest.raises(Exception) as exc:
        validate_css_file("huge.css", large_payload)
    assert "exceeds maximum allowed size" in str(exc.value.detail).lower()


# 15. Invalid text encoding
def test_invalid_text_encoding_null_bytes():
    # Binary null bytes
    corrupt_bytes = b"body { color: red; \x00\x01\x02 }"
    with pytest.raises(Exception) as exc:
        validate_css_file("corrupt.css", corrupt_bytes)
    assert "null bytes" in str(exc.value.detail).lower()


# 16. Correct statistics and JSON schema validation via API
def test_api_analyze_and_json_schema():
    sample_css = """
    /* Header */
    h1, h2 {
        color: #ff0055;
        font-size: 2rem;
    }
    p {
        color: #ff0055;
        margin: 1rem;
    }
    """
    response = client.post(
        "/api/analyze",
        files={"file": ("style.css", io.BytesIO(sample_css.encode("utf-8")), "text/css")}
    )
    assert response.status_code == 200
    data = response.json()

    # Validate Schema Structure
    assert "metadata" in data
    assert "rules" in data
    assert "at_rules" in data
    assert "detected_colors" in data
    assert "warnings" in data
    assert "top_properties" in data

    meta = data["metadata"]
    assert meta["filename"] == "style.css"
    assert meta["total_rules"] == 2
    assert meta["total_selectors"] == 3  # h1, h2, p
    assert meta["total_declarations"] == 4
    assert meta["unique_properties"] == 3  # color, font-size, margin
    assert meta["unique_colors"] == 1
    assert data["detected_colors"] == ["#ff0055"]


def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "CSS INSIGHT"


def test_api_sample():
    res = client.get("/api/sample")
    assert res.status_code == 200
    data = res.json()
    assert "content" in data
    assert len(data["content"]) > 100


# 19. Plain text upload detection (fake.css)
def test_plain_text_fake_css_detection():
    fake_css = "This is not a CSS stylesheet.\nIt is just ordinary text with no CSS rules."
    response = client.post(
        "/api/analyze",
        files={"file": ("fake.css", io.BytesIO(fake_css.encode("utf-8")), "text/css")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["total_rules"] == 0
    assert data["metadata"]["total_selectors"] == 0
    assert data["metadata"]["total_declarations"] == 0
    assert data["has_valid_rules"] is False
    assert data["is_empty"] is False
    assert data["validation_notice"] == "No valid CSS rules found. Please upload a valid CSS stylesheet."
    # Detailed tinycss2 parser diagnostic must be preserved in warnings for debugging
    assert len(data["warnings"]) >= 1
    assert any("EOF reached before {} block" in w["message"] for w in data["warnings"])


# 20. Empty CSS upload handling
def test_empty_css_api_handling():
    response = client.post(
        "/api/analyze",
        files={"file": ("empty.css", io.BytesIO(b""), "text/css")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["total_rules"] == 0
    assert data["metadata"]["total_declarations"] == 0
    assert data["is_empty"] is True
    assert data["has_valid_rules"] is False
    assert data["validation_notice"] == "Your stylesheet is empty. Add some CSS rules or upload another file."
    assert len(data["warnings"]) == 0


# 21. Rejection of renamed images (BMP and SVG)
def test_renamed_images_rejection():
    # BMP image magic header
    bmp_bytes = b"BM\x36\x00\x00\x00\x00\x00\x00\x00\x36\x00\x00\x00"
    with pytest.raises(Exception) as exc:
        validate_css_file("photo.css", bmp_bytes)
    assert "binary file" in str(exc.value.detail).lower()

    # SVG image text header
    svg_bytes = b"<svg xmlns='http://www.w3.org/2000/svg'><circle r='5'/></svg>"
    with pytest.raises(Exception) as exc_svg:
        validate_css_file("vector.css", svg_bytes)
    assert "svg image" in str(exc_svg.value.detail).lower()


# 22. Malformed CSS with missing closing brace before next rule
def test_malformed_unclosed_brace_recovery():
    malformed_css = """h1 {
    color: red;
    font-size: 24px;

.card {
    padding: 20px;
}"""
    # 1. Direct parser inspection
    rules, at_rules, warnings, comments, elapsed = parse_css_stylesheet(malformed_css, "unclosed_brace.css")
    # tinycss2 parses 'h1' as a single qualified rule auto-closed at EOF
    assert len(rules) == 1
    assert rules[0].selector == "h1"
    # Preserves declarations recovered before syntax breakdown
    decls = {d.property: d.value for d in rules[0].declarations}
    assert decls["color"] == "red"
    assert decls["font-size"] == "24px"
    assert len(rules[0].declarations) == 2
    # At-rules count
    assert len(at_rules) == 0
    # Captured parser recovery diagnostic from tinycss2
    assert len(warnings) == 1
    assert warnings[0].type == "parse_error"
    assert warnings[0].line == 5
    assert warnings[0].column == 1
    assert "Expected <ident> for declaration name" in warnings[0].message

    # 2. Full API endpoint round-trip
    response = client.post(
        "/api/analyze",
        files={"file": ("unclosed_brace.css", io.BytesIO(malformed_css.encode("utf-8")), "text/css")}
    )
    assert response.status_code == 200
    data = response.json()
    meta = data["metadata"]
    assert meta["total_rules"] == 1
    assert meta["total_selectors"] == 1
    assert meta["total_declarations"] == 2
    assert meta["unique_properties"] == 2
    assert meta["unique_colors"] == 1
    assert data["detected_colors"] == ["red"]
    assert len(data["warnings"]) == 1
    assert data["warnings"][0]["line"] == 5
    assert data["warnings"][0]["column"] == 1
    assert data["has_valid_rules"] is True
    assert data["is_empty"] is False
    assert data["validation_notice"] is None
