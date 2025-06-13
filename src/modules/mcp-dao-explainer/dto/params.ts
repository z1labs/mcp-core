export interface Organization {
    id: string;
    name: string;
    slug: string;
    chainIds: string[];
    tokenIds: string[];
    governorIds: string[];
    proposalsCount: number;
    tokenOwnersCount: number;
    delegatesCount: number;
    delegatesVotesCount: number;
    hasActiveProposals: boolean;
    metadata: {
        description: string;
        icon: string;
        socials: {
            website: string;
            discord: string;
            twitter: string;
        };
    };
}

export interface PageInfo {
    firstCursor: string | null;
    lastCursor: string | null;
    count: number;
}

export interface OrganizationsResponse {
    organizations: {
        nodes: Organization[];
        pageInfo: PageInfo;
    };
}

// Basic Types
export type OrganizationsSortBy = "id" | "name" | "explore" | "popular";

// Input Types
export interface OrganizationsSortInput {
    isDescending: boolean;
    sortBy: OrganizationsSortBy;
}

export interface PageInput {
    afterCursor?: string;
    beforeCursor?: string;
    limit?: number;
}

export interface OrganizationsFiltersInput {
    hasLogo?: boolean;
    chainId?: string;
    isMember?: boolean;
    address?: string;
    slug?: string;
    name?: string;
}

export interface OrganizationsInput {
    filters?: OrganizationsFiltersInput;
    page?: PageInput;
    sort?: OrganizationsSortInput;
    search?: string;
}

export interface OrganizationsResponseFormattedResult {
    id?: string,
    name?: string,
    description?: string,
    icon?: string,
    website?: string,
    discord?: string,
    twitter?: string
    hasActiveProposals?: string,
    proposalsCount?: number,
    delegatesCount?: number,
    delegatesVotesCount?: string,
    tokenOwnersCount?: number
}

// -----------------------------------------------------
// Proposals interfaces

export type AccountID = string;
export type IntID = string;

// Input Types
export interface ProposalsInput {
    filters?: {
        governorId?: AccountID;
        organizationId?: IntID;
        includeArchived?: boolean;
        isDraft?: boolean;
    };
    page?: {
        afterCursor?: string;
        beforeCursor?: string;
        limit?: number; // max 50
    };
    sort?: {
        isDescending: boolean;
        sortBy: "id"; // default sorts by date
    };
}

export interface ExecutableCall {
    value: string;
    target: string;
    calldata: string;
    signature: string;
    type: string;
}

export interface ProposalMetadata {
    description: string;
    title: string;
    discourseURL: string | null;
    snapshotURL: string | null;
}

export interface TimeBlock {
    timestamp: string;
}

export interface VoteStat {
    votesCount: string;
    percent: number;
    type: string;
    votersCount: number;
}

export interface ProposalGovernor {
    id: string;
    chainId: string;
    name: string;
    token: {
        decimals: number;
    };
    organization: {
        name: string;
        slug: string;
    };
}

export interface ProposalProposer {
    address: string;
    name: string;
    picture: string | null;
}

export interface Proposal {
    id: string;
    onchainId: string;
    status: string;
    createdAt: string;
    quorum: string;
    metadata: ProposalMetadata;
    start: TimeBlock;
    end: TimeBlock;
    executableCalls: ExecutableCall[];
    voteStats: VoteStat[];
    governor: ProposalGovernor;
    proposer: ProposalProposer;
}


export interface ProposalsResponse {
    proposals: {
        nodes: Proposal[];
        pageInfo: {
            firstCursor: string;
            lastCursor: string;
        };
    };
}


export interface ProposalsResponseFormattedResult {
    id?: string,
    onchainId?: string,
    status?: string,
    createdAt?: string,
    quorum?: string,
    title?: string,
    description?: string,
    snapshotURL?: string,
    startTime: string,
    endTime: string,
}

export interface ProposalDetailsMetadata {
    title: string;
    description: string;
    discourseURL: string;
    snapshotURL: string;
}

export interface ProposalDetailsVoteStats {
    votesCount: string;
    votersCount: number;
    type: "for" | "against" | "abstain" | "pendingfor" | "pendingagainst" | "pendingabstain";
    percent: number;
}

export interface ProposalDetailsGovernor {
    id: AccountID;
    chainId: string;
    name: string;
    token: {
        decimals: number;
    };
    organization: {
        name: string;
        slug: string;
    };
}

export interface ProposalDetailsProposer {
    address: AccountID;
    name: string;
    picture?: string;
}

export interface ProposalDetails {
    id: IntID;
    onchainId: string;
    metadata: ProposalDetailsMetadata;
    status: "active" | "canceled" | "defeated" | "executed" | "expired" | "pending" | "queued" | "succeeded";
    quorum: string;
    start: TimeBlock;
    end: TimeBlock;
    executableCalls: ExecutableCall[];
    voteStats: ProposalDetailsVoteStats[];
    governor: ProposalDetailsGovernor;
    proposer: ProposalDetailsProposer;
}


export interface ProposalDetailsResponse {
    proposal: ProposalDetails;
}

export interface ProposalDetailsFormattedResult {
    title?: string;
    createdAt?: string,
    snapshotURL?: string,
    startTime?: string,
    endTime?: string,
    voteStats: VoteStat[];
}
