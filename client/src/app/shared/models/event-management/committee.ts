import { CML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';

import { BaseModel } from '../base/base-model';

export class Committee extends BaseModel<Committee> {
    public static COLLECTION = `committee`;

    public id: Id;
    public name: string;
    public description: string;

    public meeting_ids: Id[]; // (meeting/committee_id)[];
    public default_meeting_id: Id; // meeting/default_meeting_for_committee_id;
    public template_meeting_id: Id; // meeting/template_meeting_for_committee_id;
    public user_ids: Id[]; // (user/committee_ids)[];
    public forward_to_committee_ids: Id[]; // (committee/receive_forwardings_from_committee_ids)[];
    public receive_forwardings_from_committee_ids: Id[]; // (committee/forward_to_committee_ids)[];
    public organization_id: Id; // organization/committee_ids;
    public organization_tag_ids: Id[]; // (committee/organization_tag_ids)[];
    public user_$_management_level: CML[]; // (user/committee_$_management_level)[]

    public constructor(input?: any) {
        super(Committee.COLLECTION, input);
    }

    public user_management_level_ids(cml: CML): Id[] {
        return this[`user_$${cml}_management_level`];
    }
}
