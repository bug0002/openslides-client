import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'app/core/definitions/key-types';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Reset password component.
 *
 */
@Component({
    selector: `os-reset-password-confirm`,
    templateUrl: `./reset-password-confirm.component.html`,
    styleUrls: [`../../assets/reset-password-pages.scss`]
})
export class ResetPasswordConfirmComponent extends BaseComponent implements OnInit {
    /**
     * THis form holds one control for the new password.
     */
    public newPasswordForm: FormGroup;

    /**
     * The user_id that should be provided in the queryparams.
     */
    private user_id: Id;

    /**
     * The token that should be provided in the queryparams.
     */
    private token: string;

    /**
     * Constructur for the reset password confirm view. Initializes the form for the new password.
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private userRepo: UserRepositoryService
    ) {
        super(componentServiceCollector, translate);
        this.newPasswordForm = formBuilder.group({
            password: [``, [Validators.required]]
        });
    }

    /**
     * Sets the title of the page and gets the queryparams.
     */
    public ngOnInit(): void {
        super.setTitle(`Reset password`);
        this.activatedRoute.queryParams.subscribe(params => {
            if (!this.user_id && !this.token) {
                if (!params.user_id || !params.token) {
                    setTimeout(() => {
                        this.matSnackBar.open(``);
                        this.matSnackBar.open(
                            this.translate.instant(`The link is broken. Please contact your system administrator.`),
                            this.translate.instant(`OK`),
                            {
                                duration: 0
                            }
                        );
                        this.router.navigate([`..`]);
                    });
                } else {
                    this.user_id = Number(params.user_id);
                    this.token = params.token;
                }
            }
        });
    }

    /**
     * Submit the new password.
     */
    public async submitNewPassword(): Promise<void> {
        if (this.newPasswordForm.invalid) {
            return;
        }

        try {
            await this.userRepo.forgetPasswordConfirm({
                user_id: this.user_id,
                authorization_token: this.token,
                new_password: this.newPasswordForm.get(`password`).value
            });
            // TODO: Does we get a response for displaying?
            this.matSnackBar.open(
                this.translate.instant(`Your password was resetted successfully!`),
                this.translate.instant(`OK`),
                {
                    duration: 0
                }
            );
            this.router.navigate([`..`]);
        } catch (e) {
            console.log(`error`, e);
        }
    }
}
