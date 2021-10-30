import {
    PluginSettingTab,
    Setting,
    TextComponent,
    ToggleComponent,
} from 'obsidian';

import FileExplorerNoteTitle from './main';

export interface FileExplorerNoteTitleSettings {
    useMarkdownTitle: boolean;
    useFrontmatterTitle: boolean;
    frontmatterTitleField: string;
    useAliasTitle: boolean;
}

export const DEFAULT_SETTINGS: FileExplorerNoteTitleSettings = {
    useMarkdownTitle: true,
    useFrontmatterTitle: true,
    frontmatterTitleField: 'title',
    useAliasTitle: false,
};

export class FileExplorerTitleSettingTab extends PluginSettingTab {
    heading: Setting;
    useFrontmatterFieldSetting: Setting;
    frontmatterFieldSetting: Setting;
    useAliasTitleSetting: Setting;
    useMarkdownHeaderSetting: Setting;

    plugin: FileExplorerNoteTitle;

    constructor(plugin: FileExplorerNoteTitle) {
        super(plugin.app, plugin);
        this.plugin = plugin;
        let { containerEl } = this;
        this.heading = new Setting(containerEl)
            .setName('File Explorer Note Title Settings')
            .setHeading();
        this.useFrontmatterFieldSetting = new Setting(containerEl)
            .setName('Use Frontmatter Field as Title')
            .setDesc('Should use frontmatter field as title?')
            .addToggle((toggle: ToggleComponent) => {
                toggle
                    .setValue(this.plugin.settings.useFrontmatterTitle)
                    .onChange((value) => {
                        this.plugin.settings.useFrontmatterTitle = value;
                        this.updateSettings();
                    });
            });
        this.frontmatterFieldSetting = new Setting(containerEl)
            .setName('Frontmatter Title Field')
            .addText((component: TextComponent) => {
                component
                    .setValue(this.plugin.settings.frontmatterTitleField)
                    .onChange((value) => {
                        this.plugin.settings.frontmatterTitleField = value;
                        this.updateSettings();
                    });
            })
            .setDisabled(!this.plugin.settings.useFrontmatterTitle);

        this.useAliasTitleSetting = new Setting(containerEl)
            .setName('Use First Alias as Title')
            .setDesc('Should first alias in frontmatter be used as title?')
            .addToggle((toggle: ToggleComponent) => {
                toggle
                    .setValue(this.plugin.settings.useAliasTitle)
                    .onChange((value) => {
                        this.plugin.settings.useAliasTitle = value;
                        this.updateSettings();
                    });
            });

        this.useMarkdownHeaderSetting = new Setting(containerEl)
            .setName('Use Markdown Header as Title')
            .setDesc('Should markdown headings be used as title?')
            .addToggle((toggle: ToggleComponent) => {
                toggle
                    .setValue(this.plugin.settings.useMarkdownTitle)
                    .onChange((value) => {
                        this.plugin.settings.useMarkdownTitle = value;
                        this.updateSettings();
                    });
            });
    }

    display() {
        this.updateComponents();
        this.updateSettings();
    }
    updateComponents() {
        (this.useAliasTitleSetting.components[0] as ToggleComponent).setValue(
            this.plugin.settings.useAliasTitle,
        );
        (
            this.useFrontmatterFieldSetting.components[0] as ToggleComponent
        ).setValue(this.plugin.settings.useFrontmatterTitle);
        (
            this.useMarkdownHeaderSetting.components[0] as ToggleComponent
        ).setValue(this.plugin.settings.useMarkdownTitle);
        (this.frontmatterFieldSetting.components[0] as TextComponent).setValue(
            this.plugin.settings.frontmatterTitleField,
        );
    }

    updateSettings() {
        this.frontmatterFieldSetting.setDisabled(
            !this.plugin.settings.useFrontmatterTitle,
        );
    }

    hide() {
        this.plugin.saveData(this.plugin.settings);
        this.plugin.refresh();
    }
}
