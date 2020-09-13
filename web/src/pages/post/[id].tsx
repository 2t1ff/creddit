import React from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useRouter } from "next/router";
import { useMeQuery, usePostQuery } from "../../generated/graphql";
import { Layout } from "../../components/Layout";
import { Heading, Flex, Spinner, Box } from "@chakra-ui/core";
import { UpvoteSection } from "../../components/UpvoteSection";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";

export const Post: React.FC = ({}) => {
	const [{ data: meData }] = useMeQuery();
	const [{ data, fetching, error }] = useGetPostFromUrl();
	if (fetching) {
		return (
			<Layout>
				{" "}
				<Spinner />
			</Layout>
		);
	}

	if (error) {
		return <div>{error.message}</div>;
	}

	if (!data?.post) {
		return (
			<Layout>
				<Box>Could not find post</Box>
			</Layout>
		);
	}

	return (
		<Layout>
			<Heading textAlign="center">{data.post.title}</Heading>
			<Flex mt={4} mb={3} alignItems="center">
				{data.post.text}
			</Flex>

			{meData?.me?.id !== data.post.id ? null : (
				<EditDeletePostButtons id={data.post.id} />
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
