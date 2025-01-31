import { Injectable, Injector } from '@angular/core';
import { BaseRepository } from 'app/core/repositories/base-repository';
import { ManagementAppConfig } from 'app/management/management.config';
import { AgendaAppConfig } from 'app/site/agenda/agenda.config';
import { AssignmentsAppConfig } from 'app/site/assignments/assignments.config';
import { isSearchable } from 'app/site/base/searchable';
import { CHAT_CONFIG } from 'app/site/chat/chat.config';
import { CinemaAppConfig } from 'app/site/cinema/cinema.config';
import { CommonAppConfig } from 'app/site/common/common.config';
// import { HistoryAppConfig } from 'app/site/history/history.config';
import { MediafileAppConfig } from 'app/site/mediafiles/mediafile.config';
import { SettingsAppConfig } from 'app/site/meeting-settings/meeting-settings.config';
import { MotionsAppConfig } from 'app/site/motions/motions.config';
import { PollsAppConfig } from 'app/site/polls/polls.config';
import { ProjectorAppConfig } from 'app/site/projector/projector.config';
import { TagAppConfig } from 'app/site/tags/tag.config';
import { TopicsAppConfig } from 'app/site/topics/topics.config';
import { UsersAppConfig } from 'app/site/users/users.config';

import { ServicesToLoadOnAppsLoaded } from '../core.module';
import { AppConfig, ModelEntry, SearchableModelEntry } from '../definitions/app-config';
import { OnAfterAppsLoaded } from '../definitions/on-after-apps-loaded';
import { SearchService } from '../ui-services/search.service';
import { CollectionMapperService } from './collection-mapper.service';
import { FallbackRoutesService } from './fallback-routes.service';
import { MainMenuService } from './main-menu.service';

/**
 * A list of all app configurations of all delivered apps.
 */
const appConfigs: AppConfig[] = [
    CommonAppConfig,
    ManagementAppConfig,
    AgendaAppConfig,
    AssignmentsAppConfig,
    MotionsAppConfig,
    PollsAppConfig,
    MediafileAppConfig,
    TagAppConfig,
    UsersAppConfig,
    // HistoryAppConfig,
    ProjectorAppConfig,
    TopicsAppConfig,
    CinemaAppConfig,
    SettingsAppConfig,
    CHAT_CONFIG
];

/**
 * Handles loading of all apps during the bootup process.
 */
@Injectable({
    providedIn: `root`
})
export class AppLoadService {
    /**
     * Constructor.
     *
     * @param modelMapper
     * @param mainMenuService
     * @param searchService
     */
    public constructor(
        private modelMapper: CollectionMapperService,
        private mainMenuService: MainMenuService,
        private searchService: SearchService,
        private injector: Injector,
        private fallbackRoutesService: FallbackRoutesService
    ) {}

    public async loadApps(): Promise<void> {
        const repositories: OnAfterAppsLoaded[] = [];
        appConfigs.forEach((config: AppConfig) => {
            if (config.models) {
                config.models.forEach(entry => {
                    let repository: BaseRepository<any, any> = null;
                    repository = this.injector.get(entry.repository);
                    repositories.push(repository);
                    this.modelMapper.registerCollectionElement(entry.model, entry.viewModel, repository);
                    if (this.isSearchableModelEntry(entry)) {
                        this.searchService.registerModel(
                            entry.model.COLLECTION,
                            repository,
                            entry.searchOrder,
                            entry.openInNewTab
                        );
                    }
                });
            }
            if (config.mainMenuEntries) {
                this.mainMenuService.registerEntries(config.mainMenuEntries);
                this.fallbackRoutesService.registerFallbackEntries(config.mainMenuEntries);
            }
        });

        // Collect all services to notify for the OnAfterAppsLoadedHook
        const onAfterAppsLoadedItems = ServicesToLoadOnAppsLoaded.map(service => this.injector.get(service)).concat(
            repositories
        );

        // Notify them.
        onAfterAppsLoadedItems.forEach(repo => {
            repo.onAfterAppsLoaded();
        });
    }

    private isSearchableModelEntry(entry: ModelEntry | SearchableModelEntry): entry is SearchableModelEntry {
        if ((<SearchableModelEntry>entry).searchOrder !== undefined) {
            // We need to double check, because Typescipt cannot check contructors. If typescript could differentiate
            // between  (ModelConstructor<BaseModel>) and (new (...args: any[]) => (BaseModel & Searchable)),
            // we would not have to check if the result of the contructor (the model instance) is really a searchable.
            if (!isSearchable(new entry.viewModel())) {
                throw Error(
                    `Wrong configuration for ${entry.model.COLLECTION}: you gave a searchOrder, but the model is not searchable.`
                );
            }
            return true;
        }
        return false;
    }
}
