export const startsWithEmoji = (string_: string) => {
    // This regex pattern matches both single unicode emojis and emoji sequences
    // Including emoji modifiers, ZWJ sequences, and variation selectors
    return /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D\p{Emoji_Presentation})*(?:\p{Emoji_Modifier})?/u.test(
        string_
    );
};
