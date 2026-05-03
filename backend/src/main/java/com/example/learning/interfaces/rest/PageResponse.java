package com.example.learning.interfaces.rest;

import com.example.learning.application.PageResult;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Paged list payload")
public record PageResponse<T>(
        @Schema(description = "Items in the current page", requiredMode = Schema.RequiredMode.REQUIRED)
        List<T> items,

        @Schema(description = "Total number of matched records", example = "42", requiredMode = Schema.RequiredMode.REQUIRED)
        long total,

        @Schema(description = "One-based page number", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        int page,

        @Schema(description = "Page size", example = "20", requiredMode = Schema.RequiredMode.REQUIRED)
        int size,

        @Schema(description = "Total page count", example = "3", requiredMode = Schema.RequiredMode.REQUIRED)
        int totalPages
) {

    public PageResponse {
        items = items == null ? List.of() : List.copyOf(items);
    }

    public static <T> PageResponse<T> of(List<T> items, long total, int page, int size) {
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / size);
        return new PageResponse<>(items, total, page, size, totalPages);
    }

    public static <T> PageResponse<T> from(PageResult<T> pageResult) {
        return of(pageResult.items(), pageResult.total(), pageResult.page(), pageResult.size());
    }

    public static <T> PageResponse<T> fromList(List<T> items, int page, int size) {
        int fromIndex = Math.min((page - 1) * size, items.size());
        int toIndex = Math.min(fromIndex + size, items.size());
        return of(items.subList(fromIndex, toIndex), items.size(), page, size);
    }
}
