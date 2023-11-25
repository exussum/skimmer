from skimmer.dal.models import ChannelType
from skimmer.dal.queries import (
    add_group,
    create_or_update_channel,
    delete_group,
    fetch_groups,
)


def rename_group(uid, id, name):
    return dal.rename_group(uid, id, name)
