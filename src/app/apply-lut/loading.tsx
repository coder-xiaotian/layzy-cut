import { Box, Container, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Container maxWidth="sm">
      <Skeleton width={300} height={533} />
      <Stack className="mt-2">
        <Skeleton />
        <Skeleton className="mt-2" />
        <Skeleton className="mt-2" />
        <Skeleton className="mt-2" />
      </Stack>
    </Container>
  );
}
