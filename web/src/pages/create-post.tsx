import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

interface CreatePostProps {}

const CreatePost: React.FC<CreatePostProps> = ({}) => {
    const router = useRouter();
    useIsAuth();
    const [, createPost] = useCreatePostMutation();
    return (
        <Layout>
            <Formik
                initialValues={{ title: "", text: "" }}
                onSubmit={async (values) => {
                    const { error } = await createPost({ input: values });
                    if (!error) {
                        router.push("/");
                    }
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
                                create post
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
