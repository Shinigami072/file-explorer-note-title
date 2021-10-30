import {
    CachedMetadata,
    HeadingCache,
    MetadataCache,
    parseFrontMatterAliases,
    parseFrontMatterEntry,
    Plugin,
    TFile,
} from 'obsidian';
import { FileExplorerNoteTitleSettings } from 'settings';

import FileExplorerNoteTitle from './main';

export class FilenameService {
    plugin: FileExplorerNoteTitle;
    get metadataCache(): MetadataCache {
        return this.plugin.app.metadataCache;
    }
    get settings(): FileExplorerNoteTitleSettings {
        return this.plugin.settings;
    }

    constructor(plugin: FileExplorerNoteTitle) {
        this.plugin = plugin;
    }

    /**
     * Get the name to be displayed for File
     * @param id File
     */
    public getDisplayTitleForFile(id: TFile): string {
        let cache = this.metadataCache.getFileCache(id);
        let displayTitle =
            cache != undefined ? this.getDefinedDisplayTitleFor(cache) : null;
        return displayTitle ?? id.basename;
    }
    /**
     * Get the name to be displayed for File
     * @param id Fileid
     */
    public getDisplayTitleForId(id: string): string {
        let cache = this.metadataCache.getCache(id);
        return this.getDefinedDisplayTitleFor(cache) ?? id;
    }

    private getDefinedDisplayTitleFor(
        cacheEntry: CachedMetadata,
    ): string | null {
        return (
            this.getTitleFromFrontmatter(cacheEntry) ??
            this.getTitleFromAliases(cacheEntry) ??
            this.getTitleFromHeadings(cacheEntry)
        );
    }
    private getTitleFromFrontmatter(cache: CachedMetadata): string | null {
        if (!this.settings.useFrontmatterTitle) return null;
        return parseFrontMatterEntry(
            cache.frontmatter,
            this.settings.frontmatterTitleField,
        );
    }
    private getTitleFromAliases(cache: CachedMetadata): string | null {
        if (!this.settings.useAliasTitle) return null;

        return parseFrontMatterAliases(cache.frontmatter)?.first() ?? null;
    }
    private getTitleFromHeadings(cacheEntry: CachedMetadata): string | null {
        if (!this.settings.useMarkdownTitle) return null;
        let headings = cacheEntry.headings;
        if (headings == undefined || headings.length == 0) return null;
        let headings_copy = [...headings];
        headings_copy.sort(
            (a: HeadingCache, b: HeadingCache) => a.level - b.level,
        );

        return headings_copy[0].heading;
    }
}
