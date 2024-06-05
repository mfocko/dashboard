// Copyright Contributors to the Packit project.
// SPDX-License-Identifier: MIT

import React, { useMemo } from "react";

import { cellWidth } from "@patternfly/react-table";

import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  LabelGroup,
  PageSection,
  PageSectionVariants,
  Skeleton,
  Text,
  TextContent,
  TextVariants,
} from "@patternfly/react-core";
import { StatusLabel } from "../StatusLabel/StatusLabel";
import coprLogo from "../../static/copr.ico";
import kojiLogo from "../../static/koji.ico";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { TriggerLink, TriggerSuffix } from "../Trigger/TriggerLink";
import { Timestamp } from "../utils/Timestamp";

interface StatusItem {
  packit_id: number;
  status?: string;
  target: string;
}

interface StatusItemSRPM {
  packit_id: number;
  status: string;
  target?: string;
}

interface StatusesProps {
  route: string;
  entries: (StatusItem | StatusItemSRPM)[];
  statusClass: typeof StatusLabel;
}

const Statuses: React.FC<StatusesProps> = (props) => {
  const labels = useMemo(() => {
    const labelled: React.ReactNode[] = [];
    props.entries.forEach((entry, i) => {
      labelled.push(
        <props.statusClass
          key={i}
          status={entry.status ?? entry.target!}
          target={entry.target}
          link={`/results/${props.route}/${entry.packit_id}`}
        />,
      );
    });
    return labelled;
  }, [props]);

  // Technically LabelGroup doesn't accept elements, only string. But the way it currently uses them works for us
  // Should be tested as part of a visual test
  return <LabelGroup>{labels}</LabelGroup>;
};

interface PipelineItem {
  packit_id: number;
  target: string;
  status: string;
}

interface PipelineRun {
  merged_run_id: number;
  srpm: {
    packit_id: number;
    status: string;
  };
  copr: PipelineItem[];
  koji: PipelineItem[];
  test_run: PipelineItem[];
  propose_downstream: PipelineItem[];
  pull_from_upstream: PipelineItem[];
  time_submitted: number;
  trigger: {
    repo_namespace: string;
    repo_name: string;
    git_repo: string;
    pr_id: number | null;
    issue_id: number | null;
    branch_name: string | null;
    release: string | null;
  };
}

function getBuilderLabel(run: PipelineRun) {
  const iconStyle = {
    minWidth: "14px",
    minHeight: "14px",
    width: "14px",
    height: "14px",
  };

  let text = "none";
  let icon = undefined;

  if (run.copr.length > 0) {
    icon = <img style={iconStyle} src={coprLogo} alt="Copr logo" />;
    text = "Copr";
  } else if (run.koji.length > 0) {
    icon = <img style={iconStyle} src={kojiLogo} alt="Koji logo" />;
    text = "Koji";
  }

  return (
    <>
      {icon}&nbsp;<span>{text}</span>
    </>
  );
}

const PipelineDetail = () => {
  let { id } = useParams();

  // Headings
  const columns = [
    { title: "" }, // space for forge icon
    { title: "Trigger", transforms: [cellWidth(15)] },
    { title: "Time Submitted", transforms: [cellWidth(10)] },
    { title: "Jobs", transforms: [cellWidth(70)] },
  ];

  const fetchData = () =>
    fetch(`${import.meta.env.VITE_API_URL}/runs/merged/${id}`).then(
      (response) => response.json(),
    );

  const { isError, data, isLoading } = useQuery({
    queryKey: ["pipeline", id],
    queryFn: fetchData,
  });

  if (isError) {
    return <>Server seems down</>;
  }

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Pipeline results</Text>
          <Text component="p">
            <strong>
              {data?.trigger ? (
                <TriggerLink trigger={data.trigger}>
                  <TriggerSuffix trigger={data.trigger} />
                </TriggerLink>
              ) : (
                <Skeleton width="230px" />
              )}
            </strong>
          </Text>
        </TextContent>
      </PageSection>

      <PageSection>
        <Card>
          <CardBody>
            <DescriptionList
              columnModifier={{
                default: "1Col",
                sm: "2Col",
              }}
            >
              <DescriptionListGroup>
                <DescriptionListTerm>SRPM Build</DescriptionListTerm>
                <DescriptionListDescription>
                  {isLoading ? (
                    <Skeleton width="150px" />
                  ) : data?.srpm ? (
                    <Statuses
                      route={"srpm-builds"}
                      statusClass={StatusLabel}
                      entries={[data.srpm]}
                    />
                  ) : (
                    <></>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Submitted time</DescriptionListTerm>
                <DescriptionListDescription>
                  {isLoading ? (
                    <Skeleton width="150px" />
                  ) : data?.time_submitted ? (
                    <Timestamp stamp={data.time_submitted.toString()} />
                  ) : (
                    <></>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Copr builds</DescriptionListTerm>
                <DescriptionListDescription>
                  {isLoading ? (
                    <Skeleton width="150px" />
                  ) : data?.copr.length ? (
                    <Statuses
                      route={"copr-builds"}
                      statusClass={StatusLabel}
                      entries={data.copr}
                    />
                  ) : (
                    <Text component={TextVariants.small}>
                      <i>Not available</i>
                    </Text>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Koji builds</DescriptionListTerm>
                <DescriptionListDescription>
                  {isLoading ? (
                    <Skeleton width="150px" />
                  ) : data?.koji.length ? (
                    <Statuses
                      route={"koji-builds"}
                      statusClass={StatusLabel}
                      entries={data.koji}
                    />
                  ) : (
                    <Text component={TextVariants.small}>
                      <i>Not available</i>
                    </Text>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Propose Downstreams</DescriptionListTerm>
                <DescriptionListDescription>
                  {isLoading ? (
                    <Skeleton width="150px" />
                  ) : data?.propose_downstream.length ? (
                    <Statuses
                      route={"propose-downstream"}
                      statusClass={StatusLabel}
                      entries={data.propose_downstream}
                    />
                  ) : (
                    <Text component={TextVariants.small}>
                      <i>Not available</i>
                    </Text>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Pull From Upstreams</DescriptionListTerm>
                <DescriptionListDescription>
                  {isLoading ? (
                    <Skeleton width="150px" />
                  ) : data?.koji.length ? (
                    <Statuses
                      route={"pull_from_upstream"}
                      statusClass={StatusLabel}
                      entries={data.pull_from_upstream}
                    />
                  ) : (
                    <Text component={TextVariants.small}>
                      <i>Not available</i>
                    </Text>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Testing Farm runs</DescriptionListTerm>
                <DescriptionListDescription>
                  {isLoading ? (
                    <Skeleton width="150px" />
                  ) : data?.test_run.length ? (
                    <Statuses
                      route={"testing-farm"}
                      statusClass={StatusLabel}
                      entries={data.test_run}
                    />
                  ) : (
                    <Text component={TextVariants.small}>
                      <i>Not available</i>
                    </Text>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Bodhi updates</DescriptionListTerm>
                <DescriptionListDescription>
                  {isLoading ? (
                    <Skeleton width="150px" />
                  ) : data?.bodhi_update.length ? (
                    <Statuses
                      route={"bodhi-updates"}
                      statusClass={StatusLabel}
                      entries={data.bodhi_update}
                    />
                  ) : (
                    <Text component={TextVariants.small}>
                      <i>Not available</i>
                    </Text>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </PageSection>
      <pre>{isLoading ? "{}" : JSON.stringify(data, null, 2)}</pre>
    </>
  );
};

export { PipelineDetail };