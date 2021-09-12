import FileExplorerNoteCount from 'main';
//@ts-ignore
import { GraphView } from 'obsidian';

export class GraphInteractor {
	
	plugin: FileExplorerNoteCount

	constructor(plugin: FileExplorerNoteCount) {
        this.plugin = plugin;
    }

	updateGraphNodes() {
	    let graph = this.getGraph();
	    if (graph == undefined || graph.renderer == undefined) { return }

	    //@ts-ignore
	    for(const node of graph.renderer.nodes) {
	        let text = this.getDisplayText(node);
	        node.getDisplayText = () => text;
	        
	        node.didSetTitle = true;
	        
	        node.initGraphics()
	    }

	    graph.renderer.onIframeLoad()
	}

	//@ts-ignore
	getDisplayText(node): string {
	    //@ts-ignore
	    let cache = this.plugin.app.metadataCache.getCache(node.id)
	    if (cache == undefined || cache.headings == undefined) { return node.id }
	    if (cache.headings.length == 0) { return node.id }
	    return cache.headings[0].heading
	}


	getGraphOfType(type: string): GraphView {
	    //@ts-ignore
	    let leaves = this.plugin.app.workspace.getLeavesOfType(type)    // this function takes a string instead of view object, so it's easier
        //@ts-ignore
        for (const leaf of leaves) {
           if(leaf.view.getViewType() == type) {
                console.log("found graph view")
                return leaf.view as GraphView
            } 
        }
	}

	getGraph(): GraphView {
	    //@ts-ignore
	    if (this.plugin.app.internalPlugins.getPluginById('graph')) {        // no need to bother if the graph is disabled
	        return this.getGraphOfType('graph') ?? this.getGraphOfType('localgraph')
	    }
	}
}