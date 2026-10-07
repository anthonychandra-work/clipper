from ..projects import ProjectQueue


def recover_interrupted(queue: ProjectQueue) -> list[str]:
    interrupted = queue.list_processing()
    for project_id in interrupted:
        queue.requeue(project_id)
    return interrupted
