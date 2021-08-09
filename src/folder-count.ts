import './styles/folder-count.css';

import FileExplorerNoteCount from 'main';
import {
    AbstractFileFilter,
    getParentPath,
    isFolder,
    isParent,
    iterateItems,
    withSubfolderClass,
} from 'misc';
import { AFItem, FolderItem, FileItem, TFolder, TFile, Vault } from 'obsidian';

const countFolderChildren = (folder: TFolder, filter: AbstractFileFilter) => {
    let count = 0;
    for (const af of folder.children) {
        if (filter(af)) count++;
        if (af instanceof TFolder) count += countFolderChildren(af, filter);
    }
    return count;
};

/** filter out all path that is the parent of existing path */
const filterParent = (pathList: string[]): Set<string> => {
    const list = Array.from(pathList);
    list.sort();
    for (let i = 0; i < list.length; i++) {
        if (
            i < list.length - 1 &&
            (list[i] === list[i + 1] || isParent(list[i], list[i + 1]))
        ) {
            list.shift();
            i--;
        }
    }
    return new Set(list);
};
/** get all parents and add to set if not exist */
const getAllParents = (path: string, set: Set<string>): void => {
    let parent = getParentPath(path);
    while (parent && !set.has(parent)) {
        set.add(parent);
        parent = getParentPath(parent);
    }
};
/**
 * Update folder count of target's parent
 */
export const updateCount = (
    targetList: string[],
    plugin: FileExplorerNoteCount,
    vault: Vault
): void => {
    const set = filterParent(targetList);
    for (const path of targetList) {
        getAllParents(path, set);
    }
    // set count of path
    const { fileExplorer, fileFilter } = plugin;
    if (!fileExplorer) {
        console.error('fileExplorer missing');
        return;
    }
    for (const path of set) {
        // check if path available
        if (!fileExplorer.fileItems[path]) continue;
        setCount(fileExplorer.fileItems[path] as FolderItem, fileFilter);
    }
    // empty waitingList
    targetList.length = 0;
};

export const setupCount = (plugin: FileExplorerNoteCount, vault: Vault, revert = false) => {
    if (!plugin.fileExplorer) throw new Error('fileExplorer not found');

    iterateItems(plugin.fileExplorer.fileItems, (item: AFItem) => {
        if (isFolder(item)) {
            if (revert) removeCount(item);
            else setCount(item, plugin.fileFilter);
        } else {
            setTitle(item, vault);
        }
    });
};

export const setCount = (item: FolderItem, filter: AbstractFileFilter) => {
    // if (item.file.isRoot()) return;
    const count = countFolderChildren(item.file, filter);
    item.titleEl.dataset['count'] = count.toString();
    item.titleEl.toggleClass(
        withSubfolderClass,
        Array.isArray(item.file.children) &&
            item.file.children.some((af) => af instanceof TFolder),
    );
};

const removeCount = (item: FolderItem) => {
    if (item.titleEl.dataset['count']) delete item.titleEl.dataset['count'];
    item.titleEl.removeClass(withSubfolderClass);
};

export const setTitle = (item: FileItem, vault: Vault) => {
    vault.read(item.file).then(function (val) {
        const regex = /# (.+)\s*/;
        const match = regex.exec(val);
        if (match != null) {
            const name = match[1];
            item.titleEl.dataset['name'] = name;
        } else {
            item.titleEl.dataset['name'] = null;
        }
    })
}

export const updateTitle = (
    targetList: string[], 
    plugin: FileExplorerNoteCount, 
    vault: Vault
) => {
    const { fileExplorer, fileFilter } = plugin;
    if (!fileExplorer) {
        console.error('fileExplorer missing');
        return;
    }
    for (const path of targetList) {
        // check if path available
        if (!fileExplorer.fileItems[path]) continue;
        setTitle(fileExplorer.fileItems[path] as FileItem, vault);
    }
};
