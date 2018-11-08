import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { ViewMediafile } from '../models/view-mediafile';
import { MediafileRepositoryService } from '../services/mediafile-repository.service';
import { ListViewBaseComponent } from '../../base/list-view-base';
import { MatSnackBar } from '@angular/material';

/**
 * Lists all the uploaded files.
 *
 */
@Component({
    selector: 'os-mediafile-list',
    templateUrl: './mediafile-list.component.html',
    styleUrls: ['./mediafile-list.component.css']
})
export class MediafileListComponent extends ListViewBaseComponent<ViewMediafile> implements OnInit {
    /**
     * Constructor
     *
     * @param repo the repository for files
     * @param titleService
     * @param translate
     */
    public constructor(
        titleService: Title,
        translate: TranslateService,
        matSnackBar: MatSnackBar,
        private repo: MediafileRepositoryService
    ) {
        super(titleService, translate, matSnackBar);
    }

    /**
     * Init.
     * Set the title
     */
    public ngOnInit(): void {
        super.setTitle('Files');
        this.initTable();
        this.repo.getViewModelListObservable().subscribe(newUsers => {
            this.dataSource.data = newUsers;
        });
    }

    /**
     * Click on the plus button delegated from head-bar
     */
    public onPlusButton(): void {
        console.log('clicked plus (mediafile)');
    }

    /**
     * function to Download all files
     * (serves as example to use functions on head bar)
     *
     * TODO: Not yet implemented, might not even be required
     */
    public deleteAllFiles(): void {
        console.log('do download');
    }

    /**
     * Clicking on a list row
     * @param file the selected file
     */
    public selectFile(file: ViewMediafile): void {
        console.log('The file: ', file);
    }

    /**
     * Directly download a mediafile using the download button on the table
     * @param file
     */
    public download(file: ViewMediafile): void {
        window.open(file.downloadUrl);
    }
}
