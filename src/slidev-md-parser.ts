import {SlideInfo, SlidevData, SlidevMarkdown, SourceSlideInfo} from "@slidev/types";
import {detectFeatures, parse, parseRangeString} from "@slidev/parser";

export type LoadedSlidevData = Omit<SlidevData, 'config' | 'themeMeta' | 'markdownFiles' | 'watchFiles'>

export async function load(markdown: string): Promise<LoadedSlidevData> {

    const slides: SlideInfo[] = []

    async function loadMarkdown(range?: string, frontmatterOverride?: Record<string, unknown>, importers?: SourceSlideInfo[]) {
        const md = await parse(markdown, '');
        const directImporter = importers?.at(-1)
        for (const index of parseRangeString(md.slides.length, range)) {
            const subSlide = md.slides[index - 1]
            try {
                await loadSlide(md, subSlide, frontmatterOverride, importers)
            } catch (e) {
                md.errors ??= []
                md.errors.push({
                    row: subSlide.start,
                    message: `Error when loading slide: ${e}`,
                })
                continue
            }
            if (directImporter)
                (directImporter.imports ??= []).push(subSlide)
        }

        return md
    }

    async function loadSlide(_: SlidevMarkdown, slide: SourceSlideInfo, frontmatterOverride?: Record<string, unknown>, importChain?: SourceSlideInfo[]) {
        if (slide.frontmatter.disabled || slide.frontmatter.hide)
            return
        slides.push({
            index: slides.length,
            importChain,
            source: slide,
            frontmatter: {...slide.frontmatter, ...frontmatterOverride},
            content: slide.content,
            note: slide.note,
            title: slide.title,
            level: slide.level,
        })
    }

    const entry = await loadMarkdown();

    const headmatter = {...entry.slides[0]?.frontmatter}
    if (slides[0]?.title)
        headmatter.title ??= slides[0].title

    return {
        slides,
        entry,
        headmatter,
        features: detectFeatures(slides.map(s => s.source.raw).join('')),
    }
}