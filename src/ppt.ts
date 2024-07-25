import {exportSlides, getExportOptions} from '@slidev/cli/dist/export-TPYQNCSS.js'
import {createServer, resolveOptions} from "@slidev/cli";
import {getPort} from "get-port-please";

async function exportPpt(entryFile: string) {
    const port = await getPort(12445)
    const options = await resolveOptions({ entry: entryFile }, 'export')
    const server = await createServer(
        options,
        {
            server: {port},
            clearScreen: false,
        },
    )
    await server.listen(port)
    const result = await exportSlides({
        port,
        ...getExportOptions({entry: entryFile}, options),
        format: 'pptx'
    })
    console.log(result)
    await server.close()
}

exportPpt('./slide.md');
