import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../e2e-imports.module';
import { CsvExportService } from './csv-export.service';

describe(`CsvExportService`, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [CsvExportService]
        });
    });

    it(`should be created`, inject([CsvExportService], (service: CsvExportService) => {
        expect(service).toBeTruthy();
    }));
});
