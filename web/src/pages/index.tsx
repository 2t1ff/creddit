import {
	Box,



	Button, Flex, Heading, Link,
	Stack,


	Text
} from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpvoteSection } from "../components/UpvoteSection";
import {
	useMeQuery,
	usePostsQuery
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 15,
		cursor: null as null | string,
	});
	const [{ data: meData }] = useMeQuery();
	const [{ data, fetching }] = usePostsQuery({
		variables,
	});


	if (!fetching && !data) {
		return <Layout>	</Layout>;
	}
	return (
		<Layout>
			{!data && fetching ? (
				<div>loading</div>
			) : (
				<Stack spacing={8}>
					{data!.posts.posts.map((p) =>
						!p ? null : (
							<Flex
								key={p.id}
								p={5}
								shadow="md"
								borderWidth="1px"
							>
								<UpvoteSection post={p} />
								<Box flex={1} ml={4}>
									<NextLink
										href="/post/[id]"
										as={`/post/${p.id}`}
									>
										<Link>
											<Heading fontSize="xl">
												{p.title}
											</Heading>
										</Link>
									</NextLink>
									<Text>posted by {p.creator.username}</Text>
									<Flex align="center">
										<Text flex={1} mt={4}>
											{p.textSnippet}
										</Text>

										{meData?.me?.id !==
										p.creator.id ? null : (
											<EditDeletePostButtons id={p.id} />
										)}
									</Flex>
								</Box>
							</Flex>
						)
					)}
				</Stack>
			)}
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						isLoading={fetching}
						onClick={() => {
							setVariables({
								limit: variables.limit,
								cursor:
									data.posts.posts[
										data.posts.posts.length - 1
									].createdAt,
							});
						}}
						m="auto"
						my={8}
					>
						load more
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
