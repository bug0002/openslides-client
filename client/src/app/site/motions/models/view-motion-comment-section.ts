import { HasMeeting } from 'app/management/models/view-meeting';
import { MotionCommentSection } from 'app/shared/models/motions/motion-comment-section';
import { ViewGroup } from 'app/site/users/models/view-group';

import { BaseViewModel } from '../../base/base-view-model';
import { ViewMotionComment } from './view-motion-comment';

/**
 * Motion comment section class for the View
 *
 * Stores a motion comment section including all (implicit) references
 * Provides "safe" access to variables and functions in {@link MotionCommentSection}
 * @ignore
 */
export class ViewMotionCommentSection extends BaseViewModel<MotionCommentSection> {
    public static COLLECTION = MotionCommentSection.COLLECTION;
    protected _collection = MotionCommentSection.COLLECTION;

    public get section(): MotionCommentSection {
        return this._model;
    }
}

interface IMotionCommentSectionRelations {
    comments: ViewMotionComment[];
    read_groups: ViewGroup[];
    write_groups: ViewGroup[];
}
export interface ViewMotionCommentSection extends MotionCommentSection, IMotionCommentSectionRelations, HasMeeting {}
