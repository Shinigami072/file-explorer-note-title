import { FilenameService } from 'filename-service';
import { TitleUpdater } from 'metadatacache-handler';
import { GraphNode, GraphView, TFile, View } from 'obsidian';

import { MetadataCacheHandler } from '../metadatacache-handler';
import { ViewAdapter, ViewAdapters } from './view-adapters';

class GraphViewAdapter extends ViewAdapter<GraphView> implements TitleUpdater {
    metadataCacheHandler: MetadataCacheHandler;
    filenameService: FilenameService;
    nodes: Map<String, GraphNode> = new Map<String, GraphNode>();

    constructor(
        graphView: GraphView,
        filenameService: FilenameService,
        metadataCacheHandler: MetadataCacheHandler,
    ) {
        super(graphView);
        this.filenameService = filenameService;
        this.metadataCacheHandler = metadataCacheHandler;
        this.setUp();
    }

    batchUpdateTitle(batch: TFile[]): void {
        for (const file of batch) {
            const node = this.nodes.get(file.path);
            if (node != undefined) this.updateNode(node);
        }
        this.view.renderer.onIframeLoad();
    }

    setUp(): void {
        for (const node of this.view.renderer.nodes) {
            this.updateNode(node);
        }
        this.view.renderer.onIframeLoad();
        this.metadataCacheHandler.registerTitleUpdater(this);
    }

    cleanUp(): void {
        this.metadataCacheHandler.unregisterTitleUpdater(this);
        for (const node of this.nodes) {
            this.cleanNode(node[1]);
        }
        this.nodes.clear();
    }

    private cleanNode(node: GraphNode) {
        node.getDisplayText = node.originalGetDisplayText ?? (() => node.id);
        node.originalGetDisplayText = undefined;
        node.didSetTitle = true;
        node.initGraphics();
    }

    private updateNode(node: GraphNode) {
        const text = this.getDisplayText(node);
        node.originalGetDisplayText = node.getDisplayText;
        node.getDisplayText = () => text;
        node.didSetTitle = true;
        node.initGraphics();
        this.nodes.set(node.id, node);
    }

    private getDisplayText(node: GraphNode): string {
        return this.filenameService.getDisplayTitleForId(node.id);
    }
}

export const registerGraphView = (
    viewAdapters: ViewAdapters,
    filenameService: FilenameService,
    metadataCacheHandler: MetadataCacheHandler,
) => {
    viewAdapters.registerViewType(
        'graph',
        (view: View) =>
            new GraphViewAdapter(
                view as GraphView,
                filenameService,
                metadataCacheHandler,
            ),
    );
    viewAdapters.registerViewType(
        'localgraph',
        (view: View) =>
            new GraphViewAdapter(
                view as GraphView,
                filenameService,
                metadataCacheHandler,
            ),
    );
};
export const unregisterGraphView = (viewAdapters: ViewAdapters) => {
    viewAdapters.unregisterViewType('graph');
    viewAdapters.unregisterViewType('localgraph');
};

//Reverse Engineered Type Wrappers
declare module 'obsidian' {
    export class GraphView extends View {
        renderer: GraphRenderer;
        getViewType(): string;
        getDisplayText(): string;
    }

    export class GraphRenderer {
        nodes: GraphNode[];
        onIframeLoad: () => void;
    }
    export class GraphNode {
        didSetTitle: boolean;
        originalGetDisplayText: (() => string) | undefined;
        getDisplayText: () => string;
        initGraphics: () => void;
        id: string;
    }
}
