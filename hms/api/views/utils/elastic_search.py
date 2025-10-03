# utils/search_utils.py

from rest_framework.response import Response
from rest_framework import status

def elastic_search(
    request,
    document_class,
    search_fields,
    serializer_class,
    get_queryset_method,
    serializer_context=None
):

    # 1. Get the search term
    query = request.query_params.get("q", "")
    if not query:
        return Response(
            {"error": "Please provide a search query using the 'q' parameter."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2. Run the ES query
    search = document_class.search().query(
        "multi_match",
        query=query,
        fields=search_fields,
        type="phrase_prefix"
    )
    results = search.execute()
    ids = [hit.meta.id for hit in results]

    # 3. Filter your DRF queryset
    base_qs = get_queryset_method()
    queryset = base_qs.filter(id__in=ids)

    # 4. Serialize with passed-in context
    context = serializer_context or {}
    # Always include request in context if not provided
    if "request" not in context:
        context["request"] = request

    serializer = serializer_class(queryset, many=True, context=context)
    return Response(serializer.data)
