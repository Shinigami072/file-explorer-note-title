import { debounce, Plugin, TFile } from 'obsidian';

export interface TitleUpdater {
    batchUpdateTitle(batch: Array<TFile>): void;
}
export class MetadataCacheHandler {
    constructor(plugin: Plugin) {
        plugin.registerEvent(
            plugin.app.metadataCache.on('changed', this.handler),
        );
    }

    waitingList: TFile[] = [];
    titleUpdaters: TitleUpdater[] = [];

    update = debounce(
        () => {
            this.titleUpdaters.forEach((updater: TitleUpdater) =>
                updater.batchUpdateTitle([...this.waitingList]),
            );
            this.waitingList = [];
        },
        500,
        true,
    );

    batchUpdate(files: TFile[]) {
        for (const file of files) this.waitingList.push(file);
        this.update();
    }

    handler = (file: TFile) => {
        this.waitingList.push(file);
        this.update();
    };

    registerTitleUpdater(titleUpdater: TitleUpdater) {
        this.titleUpdaters.push(titleUpdater);
    }
    unregisterTitleUpdater(titleUpdater: TitleUpdater) {
        this.titleUpdaters.remove(titleUpdater);
    }
}
