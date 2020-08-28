import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Button } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';


interface registerProps {

}


const Register: React.FC<registerProps> = ({ }) => {
    const router = useRouter();
    const [, register] = useRegisterMutation();
    return (
        <Wrapper variant="small">
            <Formik initialValues={{ username: '', password: '', email: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register(values);
                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors));
                    } else if (response.data?.register.user) {
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name="email" label="Email" placeholder="Email"></InputField>
                        <Box mt={4}>
                            <InputField name="username" label="Username" placeholder="Username"></InputField>
                        </Box>
                        <Box mt={4}>
                            <InputField name="password" label="Password" placeholder="Password" type="password"></InputField>
                        </Box>
                        <Button mt={4} isLoading={isSubmitting} type="submit" variantColor="teal">register</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(Register) 