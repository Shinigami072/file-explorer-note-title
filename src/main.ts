import { Plugin } from 'obsidian';

import { FilenameService } from './filename-service';
import { MetadataCacheHandler } from './metadatacache-handler';
import { DEFAULT_SETTINGS, FileExplorerTitleSettingTab } from './settings';
import {
    registerFileExplorerView,
    unregisterFileExplorerView,
} from './view-adapters/file-explorer-view-adapter';
import {
    registerGraphView,
    unregisterGraphView,
} from './view-adapters/graph-view-adapter';
import { ViewAdapters } from './view-adapters/view-adapters';

export default class FileExplorerNoteTitle extends Plugin {
    settings = DEFAULT_SETTINGS;

    filenameService = new FilenameService(this);
    metadataCacheHandler = new MetadataCacheHandler(this);
    viewAdapters: ViewAdapters = new ViewAdapters(this);

    loadFileExplorerAdapter() {
        //@ts-ignore
        if (this.app.internalPlugins.getPluginById('file-explorer')) {
            registerFileExplorerView(
                this.viewAdapters,
                this.filenameService,
                this.metadataCacheHandler,
                this.app.vault,
            );
            //@ts-ignore
            this.app.internalPlugins
                .getPluginById('file-explorer')
                .register(() => {
                    unregisterFileExplorerView(this.viewAdapters);
                });
        } else {
            unregisterFileExplorerView(this.viewAdapters);
        }
    }

    loadGraphViewAdapter() {
        //@ts-ignore
        if (this.app.internalPlugins.getPluginById('graph')) {
            registerGraphView(
                this.viewAdapters,
                this.filenameService,
                this.metadataCacheHandler,
            );
            //@ts-ignore
            this.app.internalPlugins
                .getPluginById('file-explorer')
                .register(() => {
                    unregisterGraphView(this.viewAdapters);
                });
        } else {
            unregisterGraphView(this.viewAdapters);
        }
    }

    async onload() {
        this.loadData().then((value) => {
            this.settings = value ?? DEFAULT_SETTINGS;
        });
        this.app.workspace.onLayoutReady(() => {
            this.loadFileExplorerAdapter();
            this.loadGraphViewAdapter();
            this.viewAdapters.updateViewAdapters();
            this.addSettingTab(new FileExplorerTitleSettingTab(this));
        });
    }

    onunload() {
        this.viewAdapters.clear();
    }

    refresh() {
        this.metadataCacheHandler.batchUpdate(
            this.app.vault.getMarkdownFiles(),
        );
    }
}
