import logging

from adapter_processor_v2.adapter_processor import AdapterProcessor
from prompt_studio.prompt_profile_manager_v2.constants import ProfileManagerKeys
from prompt_studio.prompt_studio_core_v2.exceptions import MaxProfilesReachedError

from backend.serializers import AuditSerializer

from .models import ProfileManager

logger = logging.getLogger(__name__)


class ProfileManagerSerializer(AuditSerializer):
    class Meta:
        model = ProfileManager
        fields = "__all__"

    def to_representation(self, instance):  # type: ignore
        rep: dict[str, str] = super().to_representation(instance)
        llm = rep[ProfileManagerKeys.LLM]
        embedding = rep[ProfileManagerKeys.EMBEDDING_MODEL]
        vector_db = rep[ProfileManagerKeys.VECTOR_STORE]
        x2text = rep[ProfileManagerKeys.X2TEXT]
        if llm:
            rep[ProfileManagerKeys.LLM] = AdapterProcessor.get_adapter_instance_by_id(
                llm
            )
        if embedding:
            rep[ProfileManagerKeys.EMBEDDING_MODEL] = (
                AdapterProcessor.get_adapter_instance_by_id(embedding)
            )
        if vector_db:
            rep[ProfileManagerKeys.VECTOR_STORE] = (
                AdapterProcessor.get_adapter_instance_by_id(vector_db)
            )
        if x2text:
            rep[ProfileManagerKeys.X2TEXT] = (
                AdapterProcessor.get_adapter_instance_by_id(x2text)
            )
        return rep

    def validate(self, data):
        prompt_studio_tool = data.get(ProfileManagerKeys.PROMPT_STUDIO_TOOL)

        profile_count = ProfileManager.objects.filter(
            prompt_studio_tool=prompt_studio_tool
        ).count()

        if profile_count >= ProfileManagerKeys.MAX_PROFILE_COUNT:
            raise MaxProfilesReachedError()

        return data