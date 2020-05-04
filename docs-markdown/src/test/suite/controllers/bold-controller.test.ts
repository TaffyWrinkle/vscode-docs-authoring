import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { commands, window, Selection } from "vscode";
import { formatBold, boldFormattingCommand } from "../../../controllers/bold-controller";
import * as common from "../../../helper/common";
import * as telemetry from "../../../helper/telemetry";
import { loadDocumentAndGetItReady, sleep } from "../../test.common/common";

chai.use(spies);

// tslint:disable-next-line: no-var-requires
const sinon = require("sinon");
const expect = chai.expect;

suite("Bold Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
    });
    suiteTeardown(async () => {
        await commands.executeCommand("workbench.action.closeAllEditors");
    });
    test("boldFormattingCommand", () => {
        const controllerCommands = [
            { command: formatBold.name, callback: formatBold },
        ];
        expect(boldFormattingCommand()).to.deep.equal(controllerCommands);
    });
    test("noActiveEditorMessage", () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        formatBold();
        expect(spy).to.have.been.called();
    });
    test("isMarkdownFileCheck", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        const spy = chai.spy.on(common, "isMarkdownFileCheck");
        formatBold();
        expect(spy).to.have.been.called();
        stub.restore();
    });
    test("Bold Format Empty Selection", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);

        const stub = sinon.stub(telemetry, "sendTelemetryData");
        const spy = chai.spy.on(common, "insertContentToEditor");
        formatBold();
        expect(spy).to.have.been.called();
        stub.restore();
    });
    test("Bold Format Single Selection", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);
        const editor = window.activeTextEditor;
        common.setSelectorPosition(editor!, 15, 0, 15, 1);

        const stub = sinon.stub(telemetry, "sendTelemetryData");
        const spy = chai.spy.on(common, "insertContentToEditor");
        formatBold();
        expect(spy).to.have.been.called();
        stub.restore();
    });
    test("Bold Format Word Selection", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);
        const editor = window.activeTextEditor;
        common.setSelectorPosition(editor!, 159, 0, 159, 4);
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        formatBold();
        await sleep(100);
        const line = editor?.document.lineAt(159).text;
        stub.restore();

        expect(line).to.equal("**Body**");
    });
    test("Bold Format Multiple Selection", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);
        const editor = window.activeTextEditor;
        const cursorPosition = editor!.selection.active;
        const fromPositionOne = cursorPosition.with(48, 0);
        const toPositionOne = cursorPosition.with(48, 5);
        const fromPositionTwo = cursorPosition.with(48, 13);
        const toPositionTwo = cursorPosition.with(48, 17);
        editor!.selections = [
            new Selection(fromPositionOne, toPositionOne),
            new Selection(fromPositionTwo, toPositionTwo)
        ]
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        formatBold();
        await sleep(100);
        const line = editor?.document.lineAt(48).text;
        stub.restore();

        expect(line).to.equal("**These** alerts **look** like this on docs.microsoft.com:");
    });
});