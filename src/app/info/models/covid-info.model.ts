import { CaseInfo } from "./cases.model";
import { VaccinationInfo } from "./vaccination.model";

export interface CovidInfo extends Partial<CaseInfo>, Partial<VaccinationInfo> {
}