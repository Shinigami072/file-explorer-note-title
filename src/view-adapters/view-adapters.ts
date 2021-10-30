import { Plugin, View, Workspace } from 'obsidian';

export abstract class ViewAdapter<T extends View> {
    view: T;

    constructor(view: T) {
        this.view = view;

        view.register(() => {
            this.cleanUp();
            //@ts-ignore
            view.viewAdapter = undefined;
        });
        //@ts-ignore
        view.viewAdapter = this;
    }

    abstract setUp(): void;

    abstract cleanUp(): void;
}

export class ViewAdapters {
    viewTypes: Map<string, (view: View) => ViewAdapter<View>> = new Map<
        string,
        (view: View) => ViewAdapter<View>
    >();
    workspace: Workspace;

    constructor(plugin: Plugin) {
        plugin.registerEvent(
            plugin.app.workspace.on('layout-change', () =>
                setTimeout(() => this.updateViewAdapters(), 1),
            ),
        );
        this.workspace = plugin.app.workspace;
    }
    registerViewType(
        type: string,
        viewType: (view: View) => ViewAdapter<View>,
    ) {
        console.log('Registering View Adapter', type);
        this.viewTypes.set(type, viewType);
    }
    unregisterViewType(type: string) {
        console.log('Unregistering View Adapter', type);
        if (this.viewTypes.has(type)) {
            this.viewTypes.delete(type);
            this.workspace.getLeavesOfType(type).forEach((leaf) => {
                //@ts-ignore
                if (leaf.view.viewAdapter != undefined) {
                    //@ts-ignore
                    leaf.view.viewAdapter.cleanUp();
                    //@ts-ignore
                    leaf.view.viewAdapter = undefined;
                }
            });
        }
    }

    resolve(view: View) {
        //@ts-ignore
        if (view.viewAdapter == undefined)
            this.viewTypes.get(view.getViewType())?.(view);
    }

    clear() {
        this.workspace.iterateAllLeaves((leaf) => {
            //@ts-ignore
            if (leaf.view.viewAdapter != undefined) {
                //@ts-ignore
                leaf.view.viewAdapter.cleanUp();
                //@ts-ignore
                leaf.view.viewAdapter = undefined;
            }
        });
        this.viewTypes.clear();
    }

    public updateViewAdapters() {
        for (const type of this.viewTypes.keys()) {
            for (const leaf of this.workspace.getLeavesOfType(type)) {
                this.resolve(leaf.view);
            }
        }
    }
}
