import { FilenameService } from 'filename-service';
import { FileExplorer, FileItem, TFile, Vault, View } from 'obsidian';

import { MetadataCacheHandler, TitleUpdater } from '../metadatacache-handler';
import { ViewAdapter, ViewAdapters } from './view-adapters';

class FileExplorerViewAdapter
    extends ViewAdapter<FileExplorer>
    implements TitleUpdater
{
    filenameService: FilenameService;
    metadataCacheHandler: MetadataCacheHandler;
    vault: Vault;

    constructor(
        fileExplorer: FileExplorer,
        filenameService: FilenameService,
        metadataCacheHandler: MetadataCacheHandler,
        vault: Vault,
    ) {
        super(fileExplorer);
        this.filenameService = filenameService;
        this.metadataCacheHandler = metadataCacheHandler;
        this.vault = vault;
        this.setUp();
    }

    setUp(): void {
        this.batchUpdateTitle(this.vault.getMarkdownFiles());
        this.metadataCacheHandler.registerTitleUpdater(this);
    }
    cleanUp(): void {
        this.metadataCacheHandler.unregisterTitleUpdater(this);
        for (const file of this.vault.getMarkdownFiles()) {
            const fileItem = this.view.fileItems[file.path];
            this.removeTitle(fileItem as FileItem);
        }
    }

    public batchUpdateTitle(items: Array<TFile>) {
        items.forEach((element) => {
            const fileItem = this.view.fileItems[element.path];
            this.updateTitle(fileItem as FileItem);
        });
    }

    private updateTitle(item: FileItem) {
        let displayName = this.filenameService.getDisplayTitleForFile(
            item.file,
        );
        item.titleInnerEl.innerText = displayName;
    }

    private removeTitle(item: FileItem) {
        item.titleInnerEl.innerText = item.file.basename;
    }
}

export const registerFileExplorerView = (
    viewAdapters: ViewAdapters,
    filenameService: FilenameService,
    metadataCacheHandler: MetadataCacheHandler,
    vault: Vault,
) => {
    viewAdapters.registerViewType(
        'file-explorer',
        (view: View) =>
            new FileExplorerViewAdapter(
                view as FileExplorer,
                filenameService,
                metadataCacheHandler,
                vault,
            ),
    );
};
export const unregisterFileExplorerView = (viewAdapters: ViewAdapters) => {
    viewAdapters.unregisterViewType('file-explorer');
};

//Reverse Engineered Type Wrappers
declare module 'obsidian' {
    export class FileExplorer extends View {
        fileItems: { [key: string]: AFItem };
        files: WeakMap<HTMLDivElement, TAbstractFile>;
        getViewType(): string;
        getDisplayText(): string;
    }

    export type AFItem = FolderItem | FileItem;

    export interface FileItem {
        el: HTMLDivElement;
        file: TFile;
        fileExplorer: FileExplorer;
        info: any;
        titleEl: HTMLDivElement;
        titleInnerEl: HTMLDivElement;
    }

    export interface FolderItem {
        el: HTMLDivElement;
        fileExplorer: FileExplorer;
        info: any;
        titleEl: HTMLDivElement;
        titleInnerEl: HTMLDivElement;
        file: TFolder;
        children: AFItem[];
        childrenEl: HTMLDivElement;
        collapseIndicatorEl: HTMLDivElement;
        collapsed: boolean;
        pusherEl: HTMLDivElement;
    }
}
