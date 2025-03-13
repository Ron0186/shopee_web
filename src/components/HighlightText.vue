<template>
    <span>
        <template v-for="(part, index) in highlightedText" :key="index">
            <span v-if="isMatch(part)" class="text-danger fw-bold">{{ part }}</span>
            <span v-else>{{ part }}</span>
        </template>
    </span>
</template>

<script>
import { computed } from "vue";

export default {
    name: "HighlightText",
    props: {
        text: {
            type: String,
            required: true
        },
        query: {
            type: String,
            default: ""
        }
    },
    setup(props) {
        // 將特殊字元轉譯，避免正規表示式出錯
        const escapeRegExp = (str) => {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        const highlightedText = computed(() => {
            if (!props.query) return [props.text];
            const escapedQuery = escapeRegExp(props.query);
            const regex = new RegExp(`(${escapedQuery})`, "gi");
            return props.text.split(regex);
        });

        const isMatch = (part) => part.toLowerCase() === props.query.toLowerCase();

        return { highlightedText, isMatch };
    }
};
</script>
