import { CaseInfo } from "./cases.model";
import { VaccinationInfo } from "./vaccination.model";

// Merged data
export interface CovidInfo extends Partial<CaseInfo>, Partial<VaccinationInfo> {
}