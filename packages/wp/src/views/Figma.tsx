import { memo, useEffect, useState } from "react";
import { Remove } from "../assets/icons/Remove.icon";
import { createApiKey, deleteApiKey, getApiKey } from "functions/wpdb";
import { toast } from "sonner";
import docsCardImg from "assets/documentation_card.png";
import figmaCardImg from "assets/figma_card.jpg";
import { Row } from "components/ui/Row";

export const Figma = memo(() => {
	const [apiKey, setApiKey] = useState("");
	const [deleteConfirmation, setDeleteConfirmation] = useState(false);

	const fetchKey = async () => {
		const { key } = await getApiKey();
		setApiKey(key);
	};

	const handleCreationOfApiKey = async () => {
		const { success, key } = await createApiKey();

		if (success) {
			setApiKey(key);
		}

		fetchKey();
	};

	useEffect(() => {
		fetchKey();
	}, []);

	return (
		<section id="addons" className="section">
			<div className="subsection-2">
				<div className="cards-wrapper">
					<div className="info-card">
						<div className="info-card-image">
							<img src={figmaCardImg} alt="" />
						</div>

						<div className="info-card-content">
							<h5>Sync variables to Figma</h5>
							<p>
								Our addon enables seamless two-way synchronization between this project and your Figma
								project. Simply copy the connection key below to get started.
							</p>
							<a
								href="https://docs.coreframework.com/figma"
								target="_blank"
								className="btn-primary btn-m relative transition-global"
							>
								Setup guide
							</a>
						</div>
					</div>

					<div className="info-card">
						<div className="info-card-image">
							<img src={docsCardImg} alt="" />
						</div>

						<div className="info-card-content">
							<h5>Need help?</h5>
							<p>
								We are here to assist you! Simply contact us through our website. Alternatively, you can check
								our extensive documentation by clicking the link below.
							</p>
							<a
								href="https://docs.coreframework.com/figma"
								target="_blank"
								className="btn-tertiary btn-m relative transition-global"
							>
								Learn more
							</a>
						</div>
					</div>
				</div>
			</div>

			<div className="subsection-2">
				<h2>Figma Addon Information</h2>

				<div className="bg-blue radius padding-xl">
					<p className="text-m opacity-60">
						Seamlessly synchronize your project between Core Framework's Web App/WordPress plugin and the Core
					Framework plugin inside Figma. Connect the Figma plugin using the Project ID or connection key found
						below.
					</p>
				</div>
			</div>

			<div className="subsection-2">
				<h2>Figma Addon Preferences</h2>

				<div className="grid border-secondary radius bg-overlay-1">
					<Row
						label="Connection key"
						description="This key connects the Core Framework plugin inside Figma to this WordPress site. Enter it in Figma when prompted."
						htmlFor="api_key"
						isColumn
					>
						<div className="figma-key-wrapper">
							{apiKey ? (
								<>
									<input
										onClick={() => {
											try {
												navigator.clipboard.writeText(apiKey);
												toast.success("Connection key copied to clipboard");
											} catch (e) {
												//
											}
										}}
										value={apiKey}
										className="full-width pointer"
										readOnly
									/>

									{deleteConfirmation ? (
										<div className="delete-wrapper">
											<button
												className="confirm-delete-btn btn-s btn-primary"
												onClick={async () => {
													const { success } = await deleteApiKey();
													if (success) {
														setDeleteConfirmation(false);
														setApiKey("");
																toast.success("Connection key deleted");
													}
												}}
											>
												<Remove />
												<p>Are you sure?</p>
											</button>

											<button
												className="cancel-delete-btn btn-s btn-secondary"
												onClick={() => setDeleteConfirmation(false)}
											>
												<p>No</p>
											</button>
										</div>
									) : (
										<button onClick={() => setDeleteConfirmation(true)} className="delete-btn">
											Delete
										</button>
									)}
								</>
							) : (
								<button onClick={handleCreationOfApiKey} className="btn-primary btn-m full-width relative">
									Create
								</button>
							)}
						</div>
					</Row>
				</div>
			</div>
		</section>
	);
});

Figma.displayName = "Figma";
