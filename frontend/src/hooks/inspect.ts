import useSWR, { Key, SWRResponse } from "swr";
import { bytesToString, toBytes } from "viem";

const baseURL = process.env.NEXT_PUBLIC_INSPECT_URL;

export enum InspectStatus {
    Accepted = "Accepted",
    Rejected = "Rejected",
    Exception = "Exception",
    MachineHalted = "MachineHalted",
    CycleLimitExceeded = "CycleLimitExceeded",
    TimeLimitExceeded = "TimeLimitExceeded",
}

export interface InspectReport {
    payload: string;
}

export interface InspectMetadata {
    active_epoch_index: number;
    current_input_index: number;
}

export interface InspectResponse {
    status: InspectStatus;
    exception_payload: string;
    reports: InspectReport[];
    metadata: InspectMetadata;
}

type ReportResponse<TReport> = {
    report?: TReport;
};

export type UseInspect<TReport> = SWRResponse<InspectResponse> &
    ReportResponse<TReport>;

export const useInspect = <TReport>(key: Key): UseInspect<TReport> => {
    const swr = useSWR<InspectResponse>(() =>
        key ? `${baseURL}${key}` : false
    );

    const response = swr.data;
    let report = undefined;
    if (
        response &&
        response.status == InspectStatus.Accepted &&
        response.reports.length > 0
    ) {
        const r = response.reports[0];
        const data = bytesToString(toBytes(r.payload));
        report = JSON.parse(data) as TReport;
    }

    return { ...swr, report };
};
