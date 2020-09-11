import { Box, Button, Spinner } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
    useUpdatePostMutation
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

export const EditPost = ({}) => {
	const router = useRouter();
	const intId = useGetIntId();
	const [{ data, fetching }] = useGetPostFromUrl();
	const [, updatePost] = useUpdatePostMutation();
	if (fetching) {
		return (
			<Layout>
				<Spinner />
			</Layout>
		);
	}
	if (!data?.post) {
		return <Layout>Coudln't find the post!</Layout>;
	}

	return (
		<Layout>
			<Formik
				initialValues={{
					title: data?.post?.title,
					text: data?.post?.text,
				}}
				onSubmit={async (values) => {
					await updatePost({
						id: data.post!.id,
						...values,
					});
					router.back();
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="title"
							label="Title"
							placeholder="Title"
						></InputField>
						<Box mt={4}>
							<InputField
								name="text"
								label="Body"
								placeholder="Text..."
								textarea
							></InputField>
						</Box>
						<Box>
							<Button
								mt={4}
								isLoading={isSubmitting}
								type="submit"
								variantColor="teal"
							>
								Save changes!
							</Button>
						</Box>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(EditPost);
