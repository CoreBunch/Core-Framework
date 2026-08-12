import React from "react";
import { NOT_FOUND_IMAGE_PNG } from "../constants";

export function FontNotFound() {
	return (
		<div className="empty-fonts">
			<img src={NOT_FOUND_IMAGE_PNG} alt="No Fonts Found" className="illustration" />
			<p className="empty-fonts__title">No Fonts Found</p>
		</div>
	);
}
