function extractHashtags(content: string): string[] {
  const matches = content.match(/#\w+/g);
  return matches ? matches.map((tag) => tag.toLowerCase()) : [];
}

export default extractHashtags;