import React, { useState } from "react";
import { Wrapper } from "../components/Wrapper";
import { Formik, Form } from "formik";
import login from "./login";
import { toErrorMap } from "../utils/toErrorMap";
import { InputField } from "../components/InputField";
import { Box, Flex, Link, Button } from "@chakra-ui/core";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { useForgotPasswordMutation } from "../generated/graphql";

export const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ email: ''}}
                onSubmit={async (values, { setErrors }) => {
                    await forgotPassword(values);
                    setComplete(true);
                }}
            >
                {({ isSubmitting }) => complete ? <Box>If an account with that email exists, we sent you an email</Box> : (
                    <Form>
                        <Box mt={4}>
                            <InputField
                                name="email"
                                label="Email"
                                placeholder="Email"
                            ></InputField>
                        </Box>

                        <Button
                            mt={4}
                            isLoading={isSubmitting}
                            type="submit"
                            variantColor="teal"
                        >
                            Forgot password!
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword); 