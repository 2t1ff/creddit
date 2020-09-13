import {
	Resolver,
	Query,
	Arg,
	Mutation,
	InputType,
	Field,
	Ctx,
	UseMiddleware,
	Int,
	FieldResolver,
	Root,
	ObjectType,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";

@InputType()
class PostInput {
	@Field()
	title: string;

	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];

	@Field()
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	@FieldResolver(() => User)
	creator(@Root() root: Post, @Ctx() { userLoader }: MyContext) {
		return userLoader.load(root.creatorId);
	}

	@FieldResolver(() => Int, { nullable: true })
	async voteStatus(
		@Root() root: Post,
		@Ctx() { req, upvoteLoader }: MyContext
	) {
		if (!req.session?.userId) {
			return null;
		}
		const upvote = await upvoteLoader.load({
			postId: root.id,
			userId: req.session?.userId,
		});
		return upvote ? upvote.value : null;
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		const isUpvote = value !== -1;
		const realValue = isUpvote ? 1 : -1;
		const { userId } = req.session!;

		const upvote = await Upvote.findOne({ where: { postId, userId } });
		let upvoteStatus: number | null;

		if (upvote && upvote.value !== realValue) {
			upvoteStatus = realValue;
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
                    update upvote 
                    set value = $1
                    where "postId" = $2 and "userId" = $3
                `,
					[realValue, postId, userId]
				);
				await tm.query(
					`
                    update post
                    set points = points + $1
                    where id = $2
             `,
					[realValue * 2, postId]
				);
			});
		} else if (!upvote) {
			upvoteStatus = realValue;
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
                    insert into upvote ("userId", "postId", value)
                    values ($1, $2, $3)
                `,
					[userId, postId, value]
				);
				await tm.query(
					`
                    update post
                    set points = points + $1
                    where id = $2
             `,
					[realValue, postId]
				);
			});
		} else {
			upvoteStatus = null;
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
                delete from upvote
                where "postId" = $1 and "userId" = $2
            `,
					[postId, userId]
				);
				await tm.query(
					`
                update post
                set points = points + $1
                where id = $2
         `,
					[-1 * realValue, postId]
				);
			});
		}
		const post = await Post.findOne({
			where: { id: postId },
			relations: ["creator"],
		});
		post!.voteStatus = upvoteStatus;
		return post!;
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null,
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;
		const qb = getConnection();

		const replacements: any[] = [realLimitPlusOne];

		if (cursor) {
			replacements.push(cursor)
		}

		const posts = await qb.query(
			`
                select p.*
                from post p 
                ${cursor ? `where p."createdAt" < $2 ` : ""} 
                order by p."createdAt" DESC 
                limit $1 
`,
			replacements
		);

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("input") input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({
			...input,
			creatorId: req.session?.userId,
		}).save();
	}

	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg("id", () => Int) id: number,
		@Arg("title") title: string,
		@Arg("text") text: string,
		@Ctx() { req }: MyContext
	): Promise<Post | null> {
		const result = await getConnection()
			.createQueryBuilder()
			.update(Post)
			.set({ title, text })
			.where('id = :id and "creatorId" = :creatorId', {
				id,
				creatorId: req.session?.userId,
			})
			.returning("*")
			.execute();

		return result.raw[0];
	}

	@Mutation(() => Boolean)
	async deletePost(
		@Arg("id", () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		await Post.delete({ id, creatorId: req.session?.userId });
		return true;
	}
}
