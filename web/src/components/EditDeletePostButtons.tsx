import { Box, IconButton } from '@chakra-ui/core';
import NextLink from 'next/link';
import React from 'react';
import { useDeletePostMutation } from '../generated/graphql';

interface EditDeletePostButtonsProps {
    id: number
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({id}) => {
    const [, deletePost] = useDeletePostMutation();
    return(<Box>
        <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
        alignSelf="bottom"
            ml="auto"
            size="xs"
            variant="ghost"
            variantColor="blue"
            icon="edit"
            aria-label="Edit Post"
        />
        </NextLink>
        <IconButton
        alignSelf="bottom"
            ml={2}
            size="xs"
            variant="ghost"
            variantColor="red"
            icon="delete"
            aria-label="Delete Post"
            onClick={() =>
                deletePost({ id })
            }
        />
    </Box>);
}