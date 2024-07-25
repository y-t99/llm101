import {createServer, resolveOptions} from "@slidev/cli";
import {getPort} from "get-port-please";
import {generatePPT} from "./slidev-tool.js";

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
    const result = await generatePPT({
        port,
        slides: options.data.slides,
    })
    console.log(result)
    await server.close()
}

exportPpt('./slide.md');
