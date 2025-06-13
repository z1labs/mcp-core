import {Injectable, Logger} from '@nestjs/common';
import {gql, GraphQLClient} from 'graphql-request';
import {
    Organization,
    OrganizationsResponse,
    OrganizationsInput,
    OrganizationsResponseFormattedResult,
    ProposalsInput,
    ProposalsResponse,
    ProposalsResponseFormattedResult,
    ProposalDetailsResponse,
    ProposalDetailsFormattedResult, VoteStat
} from './dto/params'


interface ProposalFunctionsParams {
    proposalId: string;
    userId: string;
    content: string;
}

@Injectable()
export class McpDaoExplainerService {
    private readonly logger = new Logger(McpDaoExplainerService.name);
    private client: GraphQLClient;

    constructor() {
        this.client = new GraphQLClient(
            "https://api.tally.xyz/query",
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": `${process.env.TALLY_API_KEY}`,
                },
            }
        );
    }

    private async getDao(slug: string = '', id: string = ''): Promise<any> {
        const GET_DAO_QUERY = gql`
          query GetOrganization($input: OrganizationInput!) {
            organization(input: $input) {
              id
              name
              slug
              chainIds
              tokenIds
              governorIds
              proposalsCount
              tokenOwnersCount
              delegatesCount
              delegatesVotesCount
              hasActiveProposals
              metadata {
                description
                icon
                socials {
                  website
                  discord
                  twitter
                }
              }
            }
          }
        `;

        let input = {};

        if (id) {
            input = {input: {id: id}};
        } else {
            input = {input: {slug: slug}};
        }

        try {
            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await this.client.request<{ organization: Organization }>(GET_DAO_QUERY, input);

            return response.organization;
        } catch (error) {
            this.logger.error(`Failed to fetch DAO: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return [];
        }
    }

    public async listPopularDaos(): Promise<any> {

        const LIST_DAOS_QUERY = gql`
          query Organizations($input: OrganizationsInput!) {
            organizations(input: $input) {
              nodes {
                ... on Organization {
                  id
                  slug
                  name
                  chainIds
                  tokenIds
                  governorIds
                  metadata {
                    description
                    icon
                    socials {
                      website
                      discord
                      twitter
                    }
                  }
                  hasActiveProposals
                  proposalsCount
                  delegatesCount
                  delegatesVotesCount
                  tokenOwnersCount
                }
              }
              pageInfo {
                firstCursor
                lastCursor
              }
            }
          }
        `;

        const input: OrganizationsInput = {
            sort: {
                sortBy: "popular",
                // sortBy: "explore",
                isDescending: true
            },
            page: {
                limit: 10
            }
        };


        try {
            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await this.client.request<OrganizationsResponse>(LIST_DAOS_QUERY, {input});
            const filtered = response.organizations.nodes;
            const resultFiltered = filtered.map((organization: any) => {

                return {
                    id: organization?.id,
                    name: organization?.name,
                    description: organization.metadata?.description,
                    icon: organization.metadata?.icon,
                    website: organization?.metadata?.socials?.website,
                    discord: organization?.metadata?.socials?.discord,
                    twitter: organization?.metadata?.socials?.twitter,
                    hasActiveProposals: organization?.hasActiveProposals ? 'yes' : 'no',
                    proposalsCount: organization?.proposalsCount,
                    delegatesCount: organization?.delegatesCount,
                    delegatesVotesCount: organization?.delegatesVotesCount,
                    tokenOwnersCount: organization?.tokenOwnersCount,
                } as OrganizationsResponseFormattedResult;
            });

            const customInstructions = `
            !!!IMPORTANT: use this template and HTML tags <a>, <strong>, <img/>:
            
            !Below template and variables from array data:
            
               Here's a list of ${resultFiltered.length} most popular DAOs
            
               {{icon}} <strong>{name}<strong> 
               ID:{id}
               Active proposals: {hasActiveProposals}
               {description}
               Website: {{website}} // if not empty and name site!!!
               Twitter: {{twitter}} // if not empty and name username twitter!!!
               Discord: {{discord}} // if not empty and name !!!
               Proposals: {{proposalsCount}} // formatted number
               Delegates: {{delegatesCount}} // formatted number
               Delegates votes count: {{delegatesCount}} // formatted number
               tokenOwnersCount: {{tokenOwnersCount}} // formatted number

            `

            return {
                resultData: resultFiltered,
                customInstructions: customInstructions
            };
        } catch (error) {
            this.logger.error(`Failed to fetch DAOs: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return [];
        }
    }

    public async getDaoDetailsBySlug(slug: string): Promise<any> {
        const organization = await this.getDao(slug)
    }

    public async getDaoDetailsByID(id: string): Promise<any> {
        const organization = await this.getDao('', id)
    }

    public async listProposalsBySlug(slug: object): Promise<any> {
        // @ts-ignore
        const organization = await this.getDao(slug?.slug, '')

        if (!organization) {
            return [];
        }

        const LIST_PROPOSALS_QUERY = gql`
                  query ListProposals($input: ProposalsInput!) {
            proposals(input: $input) {
              nodes {
                ... on Proposal {
                  id
                  onchainId
                  status
                  createdAt
                  quorum
                  metadata {
                    description
                    title
                    discourseURL
                    snapshotURL
                  }
                  start {
                    ... on Block {
                      timestamp
                    }
                    ... on BlocklessTimestamp {
                      timestamp
                    }
                  }
                  end {
                    ... on Block {
                      timestamp
                    }
                    ... on BlocklessTimestamp {
                      timestamp
                    }
                  }
                  executableCalls {
                    value
                    target
                    calldata
                    signature
                    type
                  }
                  voteStats {
                    votesCount
                    percent
                    type
                    votersCount
                  }
                  governor {
                    id
                    chainId
                    name
                    token {
                      decimals
                    }
                    organization {
                      name
                      slug
                    }
                  }
                  proposer {
                    address
                    name
                    picture
                  }
                }
              }
              pageInfo {
                firstCursor
                lastCursor
              }
            }
          }
        `;

        const input: ProposalsInput = {
            filters: {
                organizationId: organization.id,
                includeArchived: false,
                isDraft: false
            },
            page: {
                limit: 5,
            },
            sort: {
                isDescending: true,
                sortBy: "id"
            }
        };

        try {
            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await this.client.request<ProposalsResponse>(LIST_PROPOSALS_QUERY, {input});
            const filtered = response.proposals.nodes;
            const resultFiltered = filtered.map((proposal: any) => {

                return {
                    title: proposal?.metadata?.title,
                    id: proposal.id,
                    description: proposal?.metadata?.description,
                    onchainId: proposal?.onchainId,
                    status: proposal?.status,
                    created: proposal?.createdAt,
                    quorum: proposal?.quorum,
                    snapshotURL: proposal?.metadata?.snapshotURL,
                    startTime: proposal?.start?.timestamp,
                    endTime: proposal?.end?.timestamp,
                } as ProposalsResponseFormattedResult;
            });

            const customInstructions = `
            !!!IMPORTANT: use this template and HTML tags <a>:
            
            !Below template and variables from array data:
            
               Here's a list of ${resultFiltered.length} most popular Proposals on {{networkName}}
            
               {{numeric}}. <strong>{{title}}</strong>
               ID: {id} 
               Created: {{created}} // format: yyyy-MM-dd HH:mm !!!
               Status: {{status}} // if set 'active' inline css color green else red!!!  
               Quorum: {{quorum}}
               Start time: {{startTime}} // format: yyyy-MM-dd HH:mm !!!
               End time: {{endTime}}  // format: yyyy-MM-dd HH:mm !!!
               Snapshot: {{snapshotURL}} // use <a href="{{snapshotURL}}" target="_blank">view</a> 
               Description: {{description}} // From the entire description of the proposal, make a short essay to describe the proposal

            `

            return {
                resultData: resultFiltered,
                customInstructions: customInstructions
            };
        } catch (error) {
            this.logger.error(`Failed to fetch DAOs: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return [];
        }


    }


    public async getProposalById(proposalId: object ): Promise<any> {


        const GET_PROPOSAL_QUERY = gql`
  query ProposalDetails($input: ProposalInput!) {
    proposal(input: $input) {
      id
      onchainId
      metadata {
        title
        description
        discourseURL
        snapshotURL
      }
      status
      quorum
      start {
        ... on Block {
          timestamp
        }
        ... on BlocklessTimestamp {
          timestamp
        }
      }
      end {
        ... on Block {
          timestamp
        }
        ... on BlocklessTimestamp {
          timestamp
        }
      }
      executableCalls {
        value
        target
        calldata
        signature
        type
      }
      voteStats {
        votesCount
        votersCount
        type
        percent
      }
      governor {
        id
        chainId
        name
        token {
          decimals
        }
        organization {
          name
          slug
        }
      }
      proposer {
        address
        name
        picture
      }
    }
  }
        `;

        // @ts-ignore
        const id = proposalId?.proposalId

        // @ts-ignore
        const input = {
            input: {
                id: id,
            }
        };

        try {
            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await this.client.request<ProposalDetailsResponse>(GET_PROPOSAL_QUERY, input);
            const detailsProposal = response?.proposal;

            const detailsProposalResult = {
                title: detailsProposal?.metadata?.title,
                createdAt: '',
                snapshotURL: detailsProposal?.metadata?.snapshotURL,
                startTime: detailsProposal?.start?.timestamp,
                endTime: detailsProposal?.end?.timestamp,
                voteStats: detailsProposal?.voteStats,
            } as ProposalDetailsFormattedResult;

            const customInstructions = `
            !!!IMPORTANT: use this template and HTML tags <a>:
            
            !Below template and variables from array data:
            
               Proposal results for: <strong>{{title}}</strong>
               Snapshot: {{snapshotURL}} // use <a href="{{snapshotURL}}" target="_blank">view</a>
               Status: {{status}} // if set 'active' inline css color green else red!!!  
            
               Result:
                For: {{voteStats[i].votesCount}} {{voteStats[i].percent}}% // if exist "type": "for" and CSS color green, end convert voteStats[i].votesCount to short decimal for example: 162.4m 
                Abstain: {{voteStats[i].votesCount}} {{voteStats[i].percent}}% // if exist "type": "abstain" and CSS color gray, end convert voteStats[i].votesCount to short decimal for example: 162.4m
                Against: {{voteStats[i].votesCount}} {{voteStats[i].percent}}% // if exist "type": "against" and CSS color red, end convert voteStats[i].votesCount to short decimal for example: 162.4m
               
            `

            return {
                resultData: detailsProposalResult,
                customInstructions: customInstructions
            };
        } catch (error) {
            this.logger.error(`Failed to fetch DAOs: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return [];
        }


    }

    async getProposalTimeline(proposalId: string): Promise<any> {
        // const res = await this.client.get(`/v1/proposals/${proposalId}/timeline`);
        // return res.data;
    }

    async getProposalVoters(proposalId: string, params?: Record<string, any>): Promise<any> {
        // const res = await this.client.get(`/v1/proposals/${proposalId}/voters`, {params});
        // return res.data;
    }

    async getAddressMetadata(address: string): Promise<any> {
        // const res = await this.client.get(`/v1/address/${address}`);
        // return res.data;
    }

    async getProposalSecurityAnalysis(proposalId: string): Promise<any> {
        // const res = await this.client.get(`/v1/proposals/${proposalId}/security`);
        // return res.data;
    }

    async getProposalVotesCastList(proposalId: string, params?: Record<string, any>): Promise<any> {
        // const res = await this.client.get(`/v1/proposals/${proposalId}/votes`, {params});
        // return res.data;
    }

    async getGovernanceProposalsStats(daoId: string, params?: Record<string, any>): Promise<any> {
        // const res = await this.client.get(`/v1/governance/${daoId}/stats`, {params});
        // return res.data;
    }
}
