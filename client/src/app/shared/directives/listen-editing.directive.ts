import { Directive, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/core-services/notify.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Fqid } from 'app/core/definitions/key-types';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { Subscription } from 'rxjs';

import { BaseModel } from '../models/base/base-model';

/**
 * Enum to define different types of notifications.
 */
enum EditNotificationType {
    /**
     * Type to declare editing a base-model.
     */
    TYPE_BEGIN_EDITING = `typeBeginEditing`,

    /**
     * Type if the edit-view is closing.
     */
    TYPE_CLOSING_EDITING = `typeClosingEditing`,

    /**
     * Type if changes are saved.
     */
    TYPE_SAVING_EDITING = `typeSavingEditing`,

    /**
     * Type to declare if another person is also editing the same base-model.
     */
    TYPE_ALSO_EDITING = `typeAlsoEditing`
}

/**
 * Class to specify the notifications for editing a motion.
 */
interface EditNotification {
    /**
     * The id of the motion the user wants to edit.
     * Necessary to identify if users edit the same motion.
     */
    baseModelFqid: Fqid;

    /**
     * The id of the sender.
     * Necessary if this differs from senderUserId.
     */
    senderId: number;

    /**
     * The name of the sender.
     * To show the names of the other editors
     */
    senderName: string;

    /**
     * The type of the notification.
     * Separates if the user is beginning the work or closing the edit-view.
     */
    type: EditNotificationType;
}

interface EditObject {
    editMode: boolean;
    model: BaseModel;
}

@Directive({
    selector: `[osListenEditing]`
})
export class ListenEditingDirective extends BaseComponent implements OnDestroy {
    @Input()
    public set osListenEditing(editObject: EditObject) {
        this.isEditing = editObject.editMode;
        this.baseModel = editObject.model;
        if (this.isEditing && this.baseModel) {
            this.enterEditMode();
        } else {
            this.leaveEditMode();
        }
    }

    private baseModel: BaseModel;

    /**
     * Array to recognize, if there are other persons working on the same
     * base-model and see, if those persons leave the editing-view.
     */
    private otherWorkOnBaseModel = [];

    /**
     * The variable to hold the subscription for notifications in editing-view.
     * Necessary to unsubscribe after leaving the editing-view.
     */
    private editNotificationSubscription: Subscription;

    /**
     * Constant to identify the notification-message.
     */
    private EDIT_NOTIFICATION_NAME = `editNotificationName`;

    private isEditing = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private notifyService: NotifyService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.unsubscribeEditNotifications(EditNotificationType.TYPE_CLOSING_EDITING);
    }

    private enterEditMode(): void {
        if (!this.editNotificationSubscription) {
            this.editNotificationSubscription = this.listenToEditNotification();
            this.sendEditNotification(EditNotificationType.TYPE_BEGIN_EDITING);
        }
    }

    private leaveEditMode(): void {
        this.unsubscribeEditNotifications(EditNotificationType.TYPE_CLOSING_EDITING);
    }

    /**
     * Function to send a notification, so that other persons can recognize editing the same motion,
     * if they're doing.
     *
     * @param type TypeOfNotificationViewMotion defines the type of the notification which is sent.
     * @param user Optional userId. If set the function will send a notification to the given userId.
     */
    private sendEditNotification(type: EditNotificationType, user?: number): void {
        const content: EditNotification = {
            baseModelFqid: this.baseModel.fqid,
            senderId: this.operator.operatorId,
            senderName: this.operator.shortName,
            type
        };
        if (user) {
            this.notifyService.sendToUsers(this.EDIT_NOTIFICATION_NAME, content, user);
        } else {
            this.notifyService.sendToAllUsers<EditNotification>(this.EDIT_NOTIFICATION_NAME, content);
        }
    }

    /**
     * Function to listen to notifications if the user edits this motion.
     * Handles the notification messages.
     *
     * @returns A subscription, only if the user wants to edit this motion, to listen to notifications.
     */
    private listenToEditNotification(): Subscription {
        return this.notifyService
            .getMessageObservable<EditNotification>(this.EDIT_NOTIFICATION_NAME)
            .subscribe(message => {
                const content = <EditNotification>message.message;
                const isSameFqid = !!this.baseModel.fqid && content.baseModelFqid === this.baseModel.fqid;
                if (this.operator.operatorId !== content.senderId && isSameFqid) {
                    let warning = ``;

                    switch (content.type) {
                        case EditNotificationType.TYPE_BEGIN_EDITING:
                        case EditNotificationType.TYPE_ALSO_EDITING: {
                            if (!this.otherWorkOnBaseModel.includes(content.senderName)) {
                                this.otherWorkOnBaseModel.push(content.senderName);
                            }

                            warning = `${this.translate.instant(
                                `Following users are currently editing this motion:`
                            )} ${this.otherWorkOnBaseModel}`;
                            if (content.type === EditNotificationType.TYPE_BEGIN_EDITING) {
                                this.sendEditNotification(
                                    EditNotificationType.TYPE_ALSO_EDITING,
                                    message.sender_user_id
                                );
                            }
                            break;
                        }
                        case EditNotificationType.TYPE_CLOSING_EDITING: {
                            this.recognizeOtherWorkerOnMotion(content.senderName);
                            break;
                        }
                        case EditNotificationType.TYPE_SAVING_EDITING: {
                            warning = `${content.senderName} ${this.translate.instant(
                                `has saved his work on this motion.`
                            )}`;
                            // Wait, to prevent overlapping snack bars
                            setTimeout(() => this.recognizeOtherWorkerOnMotion(content.senderName), 2000);
                            break;
                        }
                    }

                    if (warning !== ``) {
                        this.raiseWarning(warning);
                    }
                }
            });
    }

    /**
     * Function to handle leaving persons and
     * recognize if there is no other person editing the same motion anymore.
     *
     * @param senderName The name of the sender who has left the editing-view.
     */
    private recognizeOtherWorkerOnMotion(senderName: string): void {
        this.otherWorkOnBaseModel = this.otherWorkOnBaseModel.filter(value => value !== senderName);
        if (this.otherWorkOnBaseModel.length === 0) {
            this.closeSnackBar();
        }
    }

    /**
     * Function to unsubscribe the notification subscription.
     * Before unsubscribing a notification will send with the reason.
     *
     * @param unsubscriptionReason The reason for the unsubscription.
     */
    private unsubscribeEditNotifications(unsubscriptionReason: EditNotificationType): void {
        if (this.editNotificationSubscription && !this.editNotificationSubscription.closed) {
            this.sendEditNotification(unsubscriptionReason);
            this.closeSnackBar();
            this.editNotificationSubscription.unsubscribe();
        }
    }
}
