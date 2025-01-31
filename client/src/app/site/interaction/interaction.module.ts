import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgParticlesModule } from 'ng-particles';

import { SharedModule } from '../../shared/shared.module';
import { ActionBarComponent } from './components/action-bar/action-bar.component';
import { ApplauseBarDisplayComponent } from './components/applause-bar-display/applause-bar-display.component';
import { ApplauseParticleDisplayComponent } from './components/applause-particle-display/applause-particle-display.component';
import { CallComponent } from './components/call/call.component';
import { CallDialogComponent } from './components/call-dialog/call-dialog.component';
import { InteractionContainerComponent } from './components/interaction-container/interaction-container.component';
import { StreamComponent } from './components/stream/stream.component';

@NgModule({
    declarations: [
        ApplauseBarDisplayComponent,
        ApplauseParticleDisplayComponent,
        ActionBarComponent,
        InteractionContainerComponent,
        StreamComponent,
        CallComponent,
        CallDialogComponent
    ],
    imports: [CommonModule, SharedModule, NgParticlesModule, RouterModule],
    exports: [ActionBarComponent, InteractionContainerComponent]
})
export class InteractionModule {}
