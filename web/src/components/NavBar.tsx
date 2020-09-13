import React from "react";
import { Box, Link, Flex, Button, Heading } from "@chakra-ui/core";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import {useRouter} from 'next/router';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery();
	const router = useRouter();
	let body = null;
	if (fetching) {
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href="/login">
					<Link mr={2}>login</Link>
				</NextLink>
				<NextLink href="/register">
					<Link>register</Link>
				</NextLink>
			</>
		);
	} else {
		body = (
			<Flex align="center">
				<NextLink href="/create-post">
					<Button as={Link} mr={4}>
						create post
					</Button>
				</NextLink>
				<Box mr={2}>{data.me.username}</Box>
				<Button
					isLoading={logoutFetching}
					onClick={async () =>{ await logout(); router.reload()}}
					variant="link"
				>
					logout
				</Button>
			</Flex>
		);
	}
	return (
		<Flex
			position="sticky"
			top="0"
			zIndex={1}
			bg="tan "
			p={4}
			align="center"
		>
			<Flex flex={1} maxW={800} ml="auto" mr="auto">
				<NextLink href="/">
					<Link>
						<Heading>CReddit</Heading>
					</Link>
				</NextLink>
				<Flex align="center" ml={"auto"}>{body}</Flex>
			</Flex>
		</Flex>
	);
};
