import {load} from "./slidev-md-parser.js";
import {marked} from "marked";
import pptxgen from "pptxgenjs";

async function main() {
    const slidevMarkdown = await load(`---
background: default
title: PPT Generation
---
## Header

- The frontmatter of this slide is also the headmatter
- The frontmatter of this slide is also the headmatter
- The frontmatter of this slide is also the headmatter
`);
    const pptxGen = new pptxgen();

    const width = pptxGen.presLayout.width;
    const height = pptxGen.presLayout.height;

    const headmatter = slidevMarkdown.headmatter
    pptxGen.author = 'itou ng'
    const cover = pptxGen.addSlide()
    cover.background = {
        path: 'templates/subject-background.png'
    }

    cover.addText(headmatter.title as string, {
        x: 0.1 * width,
        y: 0.5 * height,
        color: '#FFFFFF',
        fontFace: 'Arial',
        fontSize: 16,
        fit: 'resize'
    })
    for (const slide of slidevMarkdown.slides) {
        const pptSlide = pptxGen.addSlide()
        const frontmatter = slide.frontmatter
        const content = slide.content
        const index = slide.index
        const title = slide.title
        const tokens = marked.lexer(content, {});
        for (const token of tokens) {
            if (token.type === 'heading') {
                pptSlide.addText(token.text, {
                    x: '7%',
                    y: '15%',
                    fontFace: 'Arial',
                    fontSize: 16,
                });
            } else if (token.type === 'list') {
                let count = 1;
                for (const item of token.items) {
                    const text = pptSlide.addText(`• ${item.text}`, {
                        x: '13%',
                        y: `${15 + 10 * (count++)}%`,
                        fontFace: 'Arial',
                        fontSize: 14,
                    });
                }
            }
        }
    }
    await pptxGen.writeFile({ fileName: "Demo.pptx" });
}

main()
