// Copyright Contributors to the Packit project.
// SPDX-License-Identifier: MIT

import {
  PageSection,
  Card,
  CardBody,
  PageSectionVariants,
  TextContent,
  Text,
  Title,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { ErrorConnection } from "../errors/ErrorConnection";
import { TriggerLink, TriggerSuffix } from "../trigger/TriggerLink";
import { useQuery } from "@tanstack/react-query";
import { Route as BodhiRoute } from "../../routes/jobs_/bodhi.$id";
import { bodhiUpdateQueryOptions } from "../../queries/bodhi/bodhiUpdateQuery";
import { Preloader } from "../shared/Preloader";
import { StatusLabel } from "../statusLabels/StatusLabel";
import { Timestamp } from "../shared/Timestamp";

export const BodhiUpdate = () => {
  const { id } = BodhiRoute.useParams();

  const { data, isError, isLoading } = useQuery(
    bodhiUpdateQueryOptions({ id }),
  );

  // If backend API is down
  if (isError) {
    return <ErrorConnection />;
  }

  // Show preloader if waiting for API data
  if (isLoading || data === undefined) {
    return <Preloader />;
  }

  if ("error" in data) {
    return (
      <PageSection>
        <Card>
          <CardBody>
            <Title headingLevel="h1" size="lg">
              Not Found.
            </Title>
          </CardBody>
        </Card>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">Bodhi Update Results</Text>
          <Text component="p">
            <strong>
              <TriggerLink trigger={data}>
                <TriggerSuffix trigger={data} />
              </TriggerLink>
              {/* <SHACopy git_repo={data.git_repo} commit_sha={data.commit_sha} /> */}
            </strong>
            <br />
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
                <DescriptionListTerm>Status</DescriptionListTerm>
                <DescriptionListDescription>
                  <StatusLabel
                    target={data.branch}
                    status={data.status}
                    link={data.web_url || undefined}
                  />{" "}
                </DescriptionListDescription>
                <DescriptionListTerm>Alias</DescriptionListTerm>
                <DescriptionListDescription>
                  {" "}
                  {data.alias !== null ? data.alias : <span>not provided</span>}
                </DescriptionListDescription>
                <DescriptionListTerm>Koji NVRs</DescriptionListTerm>
                <DescriptionListDescription>
                  {" "}
                  {data.koji_nvrs}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  Update Processing Time
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <Timestamp stamp={data.submitted_time} verbose={true} />
                </DescriptionListDescription>
                <DescriptionListTerm>Update Creation Time</DescriptionListTerm>
                <DescriptionListDescription>
                  <Timestamp stamp={data.update_creation_time} verbose={true} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </PageSection>
    </>
  );
};