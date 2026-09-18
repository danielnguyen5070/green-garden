<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sm xhtml">

  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>XML Sitemap — Ngọc Ngân Bến Tre</title>
        <style type="text/css">
          :root {
            --ink: #1a2e1c;
            --muted: #5a6b5c;
            --line: #d7e0d8;
            --bg: #f7faf7;
            --card: #ffffff;
            --accent: #2f6b3a;
            --chip: #e8f1ea;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            color: var(--ink);
            background:
              radial-gradient(ellipse 80% 50% at 0% 0%, #e8f2ea 0%, transparent 55%),
              var(--bg);
            line-height: 1.45;
          }
          .wrap {
            max-width: 960px;
            margin: 0 auto;
            padding: 2rem 1.25rem 3rem;
          }
          header {
            margin-bottom: 1.75rem;
          }
          h1 {
            margin: 0 0 0.4rem;
            font-size: clamp(1.5rem, 3vw, 2rem);
            font-weight: 700;
            letter-spacing: -0.02em;
          }
          .meta {
            margin: 0;
            color: var(--muted);
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 0.95rem;
          }
          .note {
            margin-top: 0.75rem;
            padding: 0.75rem 1rem;
            background: var(--card);
            border: 1px solid var(--line);
            border-radius: 8px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 0.875rem;
            color: var(--muted);
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: var(--card);
            border: 1px solid var(--line);
            border-radius: 10px;
            overflow: hidden;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 0.9rem;
          }
          thead {
            background: #eef5ef;
          }
          th, td {
            padding: 0.85rem 1rem;
            text-align: left;
            vertical-align: top;
            border-bottom: 1px solid var(--line);
          }
          th {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--muted);
            font-weight: 600;
          }
          tbody tr:last-child td {
            border-bottom: none;
          }
          tbody tr:hover {
            background: #f3f8f4;
          }
          a {
            color: var(--accent);
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .priority {
            font-variant-numeric: tabular-nums;
            white-space: nowrap;
          }
          .alts {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
          }
          .chip {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.2rem 0.55rem;
            background: var(--chip);
            border-radius: 999px;
            font-size: 0.8rem;
            color: var(--ink);
          }
          .chip strong {
            font-size: 0.7rem;
            text-transform: uppercase;
            color: var(--muted);
            font-weight: 700;
          }
          @media (max-width: 720px) {
            table, thead, tbody, th, td, tr {
              display: block;
            }
            thead { display: none; }
            tr {
              padding: 1rem;
              border-bottom: 1px solid var(--line);
            }
            tr:last-child { border-bottom: none; }
            td {
              padding: 0.25rem 0;
              border: none;
            }
            td::before {
              content: attr(data-label);
              display: block;
              font-size: 0.7rem;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              color: var(--muted);
              margin-bottom: 0.15rem;
              font-weight: 600;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <header>
            <h1>XML Sitemap</h1>
            <p class="meta">
              <xsl:value-of select="count(sm:urlset/sm:url)"/>
              <xsl:text> URLs · Ngọc Ngân Bến Tre</xsl:text>
            </p>
            <p class="note">
              This page is a human-readable view of the sitemap. Search engines
              read the underlying XML; the stylesheet is ignored by crawlers.
            </p>
          </header>

          <table>
            <thead>
              <tr>
                <th scope="col">URL</th>
                <th scope="col">Priority</th>
                <th scope="col">Languages</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sm:urlset/sm:url">
                <tr>
                  <td data-label="URL">
                    <a href="{sm:loc}">
                      <xsl:value-of select="sm:loc"/>
                    </a>
                  </td>
                  <td data-label="Priority" class="priority">
                    <xsl:choose>
                      <xsl:when test="sm:priority">
                        <xsl:value-of select="sm:priority"/>
                      </xsl:when>
                      <xsl:otherwise>—</xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td data-label="Languages">
                    <div class="alts">
                      <xsl:for-each select="xhtml:link[@rel='alternate']">
                        <a class="chip" href="{@href}" title="{@href}">
                          <strong><xsl:value-of select="@hreflang"/></strong>
                        </a>
                      </xsl:for-each>
                      <xsl:if test="not(xhtml:link[@rel='alternate'])">
                        <span class="chip">—</span>
                      </xsl:if>
                    </div>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
