import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote";
export const createUpvoteLoader = () =>
	new DataLoader<{ postId: number; userId: number }, Upvote | null>(
		async (keys) => {
			const upvotes = await Upvote.find(keys as any);
			const upvoteIdsToUpvote: Record<string, Upvote> = {};
			upvotes.forEach((u) => {
				upvoteIdsToUpvote[`${u.postId}|${u.userId}`] = u;
			});

			return keys.map(
				(values) =>
					upvoteIdsToUpvote[`${values.postId}|${values.userId}`]
			);
		}
	);
