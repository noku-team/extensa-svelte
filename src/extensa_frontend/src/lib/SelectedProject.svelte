<script lang="ts">
	import cx from "classnames";
	import { VARCO } from "../VARCO/helpers/VARCO";
	import { EDITOR, MAP, PLY, UI } from "../jsm";
	import { authStore } from "../store/AuthStore";
	import { messageStore } from "../store/MessageStore";
	import { projectStore } from "../store/ProjectStore";
	import { spinnerStore } from "../store/SpinnerStore";
	import executeDeleteGeoarea from "../utils/dfinity/geoareas/methods/deleteGeoarea";
	import executeDeleteProject from "../utils/dfinity/geoareas/methods/deleteProject";
	import EyeOffIcon from "/images/UI/eye-off.png";
	import EyeIcon from "/images/UI/eye.png";
	import ShareIcon from "/images/UI/icons/share.png";

	let isMinimized = false;

	const onMinimize = () => {
		isMinimized = !isMinimized;
	};

	const onEyeClick = async () => {
		EDITOR.f.loadProjectData();
		projectStore.set3DVisible(true);
	};

	const onEyeOffClick = () => {
		UI.p.previewProject.f.button_removeProject();
		projectStore.set3DVisible(false);
	};

	const onDelete = async () => {
		try {
			if (confirm("Are you sure you want to delete this project?")) {
				spinnerStore.setLoading(true);

				if (
					PLY.p?.selectedArea?.userData?.id &&
					process.env.CANISTER_ID_EXTENSA_BACKEND &&
					$authStore.identity &&
					$projectStore.project
				) {
					await executeDeleteProject({
						identity: $authStore.identity,
						canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
						projectId: $projectStore.project?.userData.id,
						geoareaId: PLY.p.selectedArea.userData.id,
					});
					await executeDeleteGeoarea({
						identity: $authStore.identity,
						canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
						geoareaId: PLY.p.selectedArea.userData.id,
					});

					EDITOR.f.deleteProject($projectStore.project);
					EDITOR.f.deleteGeoArea();
				} else {
					throw new Error();
				}
			}
		} catch (e) {
			messageStore.setMessage(
				"Oops! There was a problem removing the project. Please try again.",
				"error"
			);
			console.error(e);
		} finally {
			spinnerStore.setLoading(false);
		}
	};

	const onClose = () => {
		projectStore.setProject(null);

		UI.f.remove_menu_popups();

		EDITOR.f.deselectProjects();

		EDITOR.f.deselectGeoArea();

		if (UI.p.scene.OBJECTS.previewProject !== undefined)
			(VARCO.f as any).deleteElement(
				UI.p.scene,
				UI.p.scene.OBJECTS.previewProject
			);

		PLY.p.selectedProjectName = "";
		projectStore.setProject(null);
		PLY.p.selectedGeoAreaName = "";
	};

	const onShare = async () => {
		if (
			$projectStore.project &&
			$projectStore.project?.userData &&
			$projectStore.project?.userData?.linkedGeoArea &&
			$projectStore.project?.userData?.linkedGeoArea?.userData &&
			$projectStore.project?.userData?.linkedGeoArea?.userData?.myCoords
		) {
			const { lat, lng } =
				$projectStore.project?.userData?.linkedGeoArea?.userData.myCoords ?? {};
			const { angX, angY } = PLY.p.camera3DAxis.userData ?? {};
			const { zoomMap } = MAP.p ?? {};

			let url = `${window.location.origin}?lat=${lat}&lng=${lng}`;
			if (angX && angY) url += `&angX=${angX}&angY=${angY}`;
			if (zoomMap) url += `&zoom=${zoomMap}`;
			// add show project
			if ($projectStore?.project?.userData?.file_id) {
				url += `&project=${parseInt($projectStore.project.userData.file_id)}`;
			}

			await navigator.clipboard.writeText(url);
			messageStore.setMessage("Project link copied successfully", "success");
		} else {
			messageStore.setMessage(
				"Oops! There was a problem sharing the project. Please try again.",
				"error"
			);
		}
	};

	const isOwner = () => {
		return (
			$authStore.identity &&
			$projectStore.project &&
			$authStore.identity.getPrincipal().toString() ===
				$projectStore.project?.userData?.linkedGeoArea?.userData?.user?.[0]?.toString()
		);
	};
</script>

{#if !!$projectStore.project}
	<div
		class="fixed top-20 right-2 bg-base-100 bg-opacity-80 z-10 rounded-xl min-w-44 overflow-hidden max-w-96 transition-all duration-500 ease-in-out"
		class:minimized={isMinimized}
	>
		<div
			class={cx(
				`
			w-full
			h-full
			min-h-[200px]
			p-5
			flex
			flex-col
			gap-3
			justify-center
			items-center
			`,
				{
					conic:
						$projectStore.sendProjectProgress > 0 ||
						$projectStore.loadProjectProgress > 0,
				}
			)}
		>
			<div class="w-full flex gap-2 justify-end">
				{#if $authStore.identity && isOwner()}
					<button
						class="btn btn-error btn-circle cursor-pointer btn-sm ml-auto"
						on:click={onDelete}
						disabled={$projectStore.sendProjectProgress > 0 ||
							$projectStore.loadProjectProgress > 0 ||
							!$projectStore.project?.userData?.id}
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M10.8 2.39999C10.3455 2.39999 9.92997 2.6568 9.72669 3.06334L8.85837 4.79999H4.80001C4.13726 4.79999 3.60001 5.33725 3.60001 5.99999C3.60001 6.66274 4.13726 7.19999 4.80001 7.19999L4.80001 19.2C4.80001 20.5255 5.87452 21.6 7.20001 21.6H16.8C18.1255 21.6 19.2 20.5255 19.2 19.2V7.19999C19.8627 7.19999 20.4 6.66274 20.4 5.99999C20.4 5.33725 19.8627 4.79999 19.2 4.79999H15.1416L14.2733 3.06334C14.0701 2.6568 13.6545 2.39999 13.2 2.39999H10.8ZM8.40001 9.59999C8.40001 8.93725 8.93726 8.39999 9.60001 8.39999C10.2627 8.39999 10.8 8.93725 10.8 9.59999V16.8C10.8 17.4627 10.2627 18 9.60001 18C8.93726 18 8.40001 17.4627 8.40001 16.8V9.59999ZM14.4 8.39999C13.7373 8.39999 13.2 8.93725 13.2 9.59999V16.8C13.2 17.4627 13.7373 18 14.4 18C15.0627 18 15.6 17.4627 15.6 16.8V9.59999C15.6 8.93725 15.0627 8.39999 14.4 8.39999Z"
								fill="#1E1A1B"
							/>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M10.8 2.39999C10.3455 2.39999 9.92997 2.6568 9.72669 3.06334L8.85837 4.79999H4.80001C4.13726 4.79999 3.60001 5.33725 3.60001 5.99999C3.60001 6.66274 4.13726 7.19999 4.80001 7.19999L4.80001 19.2C4.80001 20.5255 5.87452 21.6 7.20001 21.6H16.8C18.1255 21.6 19.2 20.5255 19.2 19.2V7.19999C19.8627 7.19999 20.4 6.66274 20.4 5.99999C20.4 5.33725 19.8627 4.79999 19.2 4.79999H15.1416L14.2733 3.06334C14.0701 2.6568 13.6545 2.39999 13.2 2.39999H10.8ZM8.40001 9.59999C8.40001 8.93725 8.93726 8.39999 9.60001 8.39999C10.2627 8.39999 10.8 8.93725 10.8 9.59999V16.8C10.8 17.4627 10.2627 18 9.60001 18C8.93726 18 8.40001 17.4627 8.40001 16.8V9.59999ZM14.4 8.39999C13.7373 8.39999 13.2 8.93725 13.2 9.59999V16.8C13.2 17.4627 13.7373 18 14.4 18C15.0627 18 15.6 17.4627 15.6 16.8V9.59999C15.6 8.93725 15.0627 8.39999 14.4 8.39999Z"
								fill="black"
								fill-opacity="0.2"
							/>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M10.8 2.39999C10.3455 2.39999 9.92997 2.6568 9.72669 3.06334L8.85837 4.79999H4.80001C4.13726 4.79999 3.60001 5.33725 3.60001 5.99999C3.60001 6.66274 4.13726 7.19999 4.80001 7.19999L4.80001 19.2C4.80001 20.5255 5.87452 21.6 7.20001 21.6H16.8C18.1255 21.6 19.2 20.5255 19.2 19.2V7.19999C19.8627 7.19999 20.4 6.66274 20.4 5.99999C20.4 5.33725 19.8627 4.79999 19.2 4.79999H15.1416L14.2733 3.06334C14.0701 2.6568 13.6545 2.39999 13.2 2.39999H10.8ZM8.40001 9.59999C8.40001 8.93725 8.93726 8.39999 9.60001 8.39999C10.2627 8.39999 10.8 8.93725 10.8 9.59999V16.8C10.8 17.4627 10.2627 18 9.60001 18C8.93726 18 8.40001 17.4627 8.40001 16.8V9.59999ZM14.4 8.39999C13.7373 8.39999 13.2 8.93725 13.2 9.59999V16.8C13.2 17.4627 13.7373 18 14.4 18C15.0627 18 15.6 17.4627 15.6 16.8V9.59999C15.6 8.93725 15.0627 8.39999 14.4 8.39999Z"
								fill="black"
								fill-opacity="0.2"
							/>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M10.8 2.39999C10.3455 2.39999 9.92997 2.6568 9.72669 3.06334L8.85837 4.79999H4.80001C4.13726 4.79999 3.60001 5.33725 3.60001 5.99999C3.60001 6.66274 4.13726 7.19999 4.80001 7.19999L4.80001 19.2C4.80001 20.5255 5.87452 21.6 7.20001 21.6H16.8C18.1255 21.6 19.2 20.5255 19.2 19.2V7.19999C19.8627 7.19999 20.4 6.66274 20.4 5.99999C20.4 5.33725 19.8627 4.79999 19.2 4.79999H15.1416L14.2733 3.06334C14.0701 2.6568 13.6545 2.39999 13.2 2.39999H10.8ZM8.40001 9.59999C8.40001 8.93725 8.93726 8.39999 9.60001 8.39999C10.2627 8.39999 10.8 8.93725 10.8 9.59999V16.8C10.8 17.4627 10.2627 18 9.60001 18C8.93726 18 8.40001 17.4627 8.40001 16.8V9.59999ZM14.4 8.39999C13.7373 8.39999 13.2 8.93725 13.2 9.59999V16.8C13.2 17.4627 13.7373 18 14.4 18C15.0627 18 15.6 17.4627 15.6 16.8V9.59999C15.6 8.93725 15.0627 8.39999 14.4 8.39999Z"
								fill="black"
								fill-opacity="0.2"
							/>
						</svg>
					</button>
				{/if}
				<button
					class="btn btn-primary btn-circle cursor-pointer btn-sm"
					on:click={onShare}
				>
					<img src={ShareIcon} alt="share" />
				</button>
				<button
					class="btn btn-warning btn-circle cursor-pointer btn-sm btn-minimize"
					on:click={onMinimize}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 8h16M4 16h16"
						/>
					</svg>
				</button>
				{#if $authStore.identity}
					<button
						class="btn btn-primary btn-circle cursor-pointer btn-sm"
						on:click={onClose}
						disabled={$projectStore.sendProjectProgress > 0 ||
							$projectStore.loadProjectProgress > 0}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/></svg
						>
					</button>
				{/if}
			</div>
			<span class="font-bold text-2xl truncate max-w-full"
				>{$projectStore.project?.name?.toUpperCase()}</span
			>
			<span>ID: {$projectStore.project.uuid}</span>
			<div class="flex">
				<button
					disabled={$projectStore.project.notYetSaved}
					on:click={!$projectStore.project.is3DVisible
						? onEyeClick
						: onEyeOffClick}
					class="flex gap-2 items-center btn btn-primary"
				>
					<span
						>{!$projectStore.project.is3DVisible
							? "View project"
							: "Hide project"}</span
					>
					<img
						src={!$projectStore.project.is3DVisible ? EyeIcon : EyeOffIcon}
						alt="icon"
						class="cursor-pointer"
					/>
				</button>
			</div>
		</div>
		<button
			class="btn btn-warning btn-circle cursor-pointer btn-sm btn-deminimize"
			on:click={onMinimize}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
				/>
			</svg>
		</button>
	</div>
{/if}

<style>
	@keyframes rotate {
		100% {
			transform: rotate(1turn);
		}
	}

	.conic {
		position: relative;
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.conic::before {
		content: "";
		position: absolute;
		z-index: -2;
		left: -50%;
		top: -50%;
		width: 200%;
		height: 200%;
		background-repeat: no-repeat;
		background-position: 0 0;
		background-image: conic-gradient(
			transparent,
			theme(colors.primary),
			transparent 30%
		);
		animation: rotate 3s linear infinite;
	}

	.conic::after {
		content: "";
		position: absolute;
		z-index: -1;
		left: 8px;
		top: 8px;
		width: calc(100% - 16px);
		height: calc(100% - 16px);
		background: theme(colors.base-100);
		border-radius: 10px;
	}

	@keyframes opacityChange {
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}

	.minimized {
		width: 50px;
		height: 50px;
		min-width: unset;
		min-height: unset;
		border-radius: 50%;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.minimized > * {
		display: none;
	}

	.minimized .btn-minimize {
		position: absolute;
		left: 5px;
		top: 5px;
		display: block;
	}

	.btn-deminimize {
		display: none;
	}

	.minimized .btn-deminimize {
		display: flex;
	}
</style>
