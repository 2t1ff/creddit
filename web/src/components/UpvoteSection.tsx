import React from "react";
import { Flex, IconButton } from "@chakra-ui/core";
import {
	PostsQuery,
	PostSnippetFragment,
	useVoteMutation,
} from "../generated/graphql";

interface UpvoteSectionProps {
	post: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
	const [{ data }, vote] = useVoteMutation();
	if (data) {
		console.log(data.vote);
	}
	return (
		<Flex
			direction="column"
			alignItems="center"
			justifyContent="space-between"
		>
			<IconButton
				size="sm"
				variant="ghost"
				variantColor={post.voteStatus === 1 ? 'green' : undefined}
				aria-label="Upvote post"
				onClick={() => vote({ value: 1, postId: post.id })}
				icon="chevron-up"
			/>
			{post.points}
			<IconButton
				size="xs"
				variant="ghost"
				variantColor={post.voteStatus === -1 ? 'red' : undefined}
				aria-label="Downvote post"
				onClick={async () => {
                    console.log(await vote({ value: -1, postId: post.id }));
				}}
				icon="chevron-down"
			/>
		</Flex>
	);
};
